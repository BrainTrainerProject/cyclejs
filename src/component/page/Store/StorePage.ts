import xs, {Stream} from 'xstream';
import {Sources, State} from '../../../common/interfaces';
import {StateSource} from 'cycle-onionify';
import {DOMSource} from '@cycle/dom';
import {State as ListState} from '../../lists/cards/CardList';
import {VNode} from 'snabbdom/vnode';
import isolate from '@cycle/isolate';
import SetsComponent, {
    OrderType,
    ShowSearchedSets,
    SortType,
    State as SetComponentState
} from '../../lists/sets/SetsComponent';
import {ImportSetApi, ImportSetProps} from '../../../common/api/set/ImportSet';

export type StorePageSources = Sources & { onion: StateSource<StorePageState>, filter: any };
export interface StorePageState extends State {
    list: ListState;
    setComponent: SetComponentState;
}

export type Reducer = (prev?: StorePageState) => StorePageState | undefined;

export type Sources = {
    DOM: DOMSource;
    onion: StateSource<State>;
};

export type Sinks = {
    DOM: Stream<VNode>;
    onion: Stream<Reducer>;
};

export type Actions = {
    filter$: Stream<string>,
    resetFilter$: Stream<string>,
    reorder$: Stream<string>
};

function intent({filter}: StorePageSources): Actions {
    return {
        filter$: filter.select('search'),
        resetFilter$: filter.select('reset'),
        reorder$: xs.never()
    };
}

function model(actions: Actions): Stream<Reducer> {

    const initReducer$ = xs.of(function initReducer(): StorePageState {

        return {
            list: [],
            setComponent: {
                show: {
                    type: 'search',
                    search: {
                        param: '',
                        orderBy: OrderType.DATE,
                        sortBy: SortType.DESC
                    }
                } as ShowSearchedSets,
                showRating: true,
                showImport: true
            } as SetComponentState
        };

    });

    const searchReducer$ = actions.filter$.map(searchObject => (prevState: StorePageState) => {
        return ({
            ...prevState,
            setComponent: {
                ...prevState.setComponent,
                show: {
                    type: 'search',
                    search: {
                        ...(prevState.setComponent.show as ShowSearchedSets).search,
                        param: searchObject.value
                    }
                } as ShowSearchedSets
            } as SetComponentState
        } as StorePageState);
    });

    const resetSearchReducer$ = actions.resetFilter$.map(filterObject => (prevState: StorePageState) => {
        return ({
            ...prevState,
            setComponent: {
                ...prevState.setComponent,
                show: {
                    type: 'search',
                    search: {
                        ...(prevState.setComponent.show as ShowSearchedSets).search,
                        param: ''
                    }
                } as ShowSearchedSets
            } as SetComponentState
        } as StorePageState);
    });

    return xs.merge(initReducer$, searchReducer$, resetSearchReducer$);
}

export default function StorePage(sources: StorePageSources): any {

    const state$ = sources.onion.state$.debug('STATE CHANGE!');
    console.log(sources);

    const setsComponentSinks = isolate(SetsComponent, 'setComponent')(sources);

    function actionFilterFromSetsComponent$(type: string): Stream<any> {
        return setsComponentSinks.action.filter(action => action.type === type)
            .map(action => action.item);
    }

    const itemClick$ = actionFilterFromSetsComponent$('click');
    const importClick$ = actionFilterFromSetsComponent$('import');

    const action$ = intent(sources);
    const parentReducer$ = model(action$);
    const reducer$ = xs.merge(parentReducer$);
    const vdom$ = setsComponentSinks.DOM;

    const importRequest$ = importClick$
        .map(item => ImportSetApi.buildRequest({
            setId: item._id
        } as ImportSetProps));

    return {
        DOM_LEFT: vdom$,
        DOM_RIGHT: xs.of([]),
        onion: xs.merge(reducer$, setsComponentSinks.onion),
        HTTP: xs.merge(setsComponentSinks.HTTP, importRequest$),
        router: itemClick$.map(item => '/set/' + item._id)
    };

}