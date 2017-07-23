import xs, { Stream } from 'xstream';
import { Sources, State } from '../../../common/interfaces';
import { StateSource } from 'cycle-onionify';
import { DOMSource } from '@cycle/dom';
import { VNode } from 'snabbdom/vnode';
import isolate from '@cycle/isolate';
import SetListComponent, {
    SetListAction,
    State as SetComponentState
} from '../../lists/sets/SetList';
import { OrderType } from '../../../common/OrderType';
import { SortType } from '../../../common/SortType';
import { SearchParams } from '../../../common/repository/SetRepository';

export type StorePageSources = Sources & {
    onion: StateSource<StorePageState>,
    filter: any
};

export interface StorePageState extends State {
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

function model(): Stream<Reducer> {

    const initReducer$ = xs.of(() => ({
        setComponent: {
            list: [],
            showRating: true,
            showImport: true
        } as SetComponentState
    }));

    return xs.merge(initReducer$);

}

function listActions(actions: Actions): any {

    const initAction$ = xs.of(() => SetListAction.Search({
            param: '',
            orderBy: OrderType.DATE,
            sortBy: SortType.DESC
        } as SearchParams)
    );

    const searchAction$ = actions.filter$
        .map(searchObject => (searchObject as any).value)
        .map(searchText => (prevState) =>
            SetListAction.Search({
                ...prevState.search,
                param: searchText
            } as SearchParams)
        );

    const resetAction$ = actions.resetFilter$
        .map(searchText => (prevState) =>
            SetListAction.Search({
                ...prevState.search,
                param: ''
            } as SearchParams));

    return xs.merge(initAction$, searchAction$, resetAction$)
        .fold((listActionsRequests, reducer: any) => reducer(listActionsRequests as any), {});
}

export default function StorePage(sources: StorePageSources): any {

    const intents = intent(sources);
    const setsComponentSinks = isolate(SetListComponent, 'setComponent')(sources, listActions(intents));

    const reducer$ = model();
    const vdom$ = setsComponentSinks.DOM;

    const itemClick$ = setsComponentSinks.itemClick$;

    return {
        DOM_LEFT: vdom$,
        DOM_RIGHT: xs.of([]),
        onion: xs.merge(reducer$, setsComponentSinks.onion),
        HTTP: xs.merge(setsComponentSinks.HTTP),
        router: itemClick$.map(item => '/set/' + item._id)
    };

}