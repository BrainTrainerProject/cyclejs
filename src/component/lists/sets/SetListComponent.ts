import xs, {Stream} from 'xstream';
import {DOMSource, VNode} from '@cycle/dom';
import {StateSource} from 'cycle-onionify';
import ActionList, {State as ListState} from '../ActionList';
import isolate from '@cycle/isolate';
import {HTTPSource} from '@cycle/http';
import flattenSequentially from 'xstream/extra/flattenSequentially';
import {HttpRequest} from '../../../common/api/HttpRequest';
import SetsItem from './SetsItem';
import {
    Action as SetRepositoryAction,
    SearchParams,
    SetRepository,
    Sinks as SetRepositorySinks,
    Type as SetRepositoryActionType
} from '../../../common/repository/SetRepository';
import concat from 'xstream/extra/concat';
import {Utils} from '../../../common/Utils';

export enum ActionType {
    OWN = 'own',
    BY_ID = 'byId',
    SEARCH = 'search'
}

export type LoadOwnSetsAction = {
    type: ActionType.OWN
};

export type LoadSetsByIdAction = {
    type: ActionType.BY_ID,
    setId: string
};

export type LoadSearchedSetsAction = {
    type: ActionType.SEARCH,
    search: SearchParams
};

export type Action = LoadOwnSetsAction | LoadSetsByIdAction | LoadSearchedSetsAction;

export type State = {
    list: ListState,
    showRating: boolean,
    showImport: boolean
};

export type Reducer = (prev?: State) => State | undefined;

export type Sources = {
    DOM: DOMSource;
    HTTP: HTTPSource;
    onion: StateSource<State>;
};

export type Sinks = {
    DOM: Stream<VNode>;
    HTTP: Stream<HttpRequest>;
    onion: Stream<Reducer>;
    itemClick$: Stream<object>;
    importClick$: Stream<object>;
};

export default function SetListComponent(sources: Sources, action$: Stream<Action>): Sinks {

    const state$ = sources.onion.state$.debug('SetList Component State$');

    const setRepository: SetRepositorySinks = SetRepository(sources as any, listIntent(action$));

    const listSinks = isolate(ActionList, 'list')(sources, SetsItem);
    const reducer$ = reducer(intent(setRepository));

    const itemClick$ = listSinks.callback$.filter(callback => callback.type === 'click')
        .map(callback => callback.item);

    const importClick$ = listSinks.callback$.filter(callback => callback.type === 'import')
        .map(callback => callback.item);

    return {
        DOM: listSinks.DOM,
        HTTP: xs.merge(setRepository.HTTP),
        onion: reducer$,
        itemClick$: itemClick$,
        importClick$: importClick$
    };
}

function intent(setRepository: SetRepositorySinks): any {
    const response = setRepository.response;
    return {
        showOwnSets$: response.getSetsApi$,
        showSearchSets$: response.searchSetsApi$
    };
}

function listIntent(action$: Stream<Action>): Stream<SetRepositoryAction> {

    function filterType(type: ActionType): Stream<Action> {
        return action$
            .filter(action => action.type === type);
    }

    const ownSetsAction$ = filterType(ActionType.OWN)
        .map(action => ({
            type: SetRepositoryActionType.OWN_SETS
        } as SetRepositoryAction));

    const getSetAction$ = filterType(ActionType.BY_ID)
        .map(action => ({
            type: SetRepositoryActionType.SET,
            setId: (action as LoadSetsByIdAction).setId
        } as SetRepositoryAction));

    const searchAction$ = filterType(ActionType.SEARCH)
        .map(action => ({
            type: SetRepositoryActionType.SEARCH,
            search: (action as LoadSearchedSetsAction).search
        } as SetRepositoryAction));

    return xs.merge(ownSetsAction$, getSetAction$, searchAction$).remember();

}

function defaultState(state: State): State {
    return {
        ...state,
        list: [],
        showRating: false,
        showImport: false
    };
}

function reducer(intent: any): Stream<any> {

    const initReducer$ = xs.of((state) => {
        if (state) {
            return state;
        }
        return defaultState(state);
    });

    const responseGetSetsApi$ = intent.showOwnSets$;
    const responseSearchSetsApi$ = intent.showSearchSets$;

    const clearSets$ = xs.of((state) => ({
        ...state,
        list: []
    }));

    function fillListByResponse$(stream$: Stream<any>): Stream<any> {
        return stream$.map(array => xs.fromArray(array))
            .compose(flattenSequentially)
            .map(item => (state) => {

                // Verzögerung notwendig, sonst kommt es zu 'race condition' mit dem vdom$
                Utils.syncDelay(1);

                return ({
                    ...state,
                    list: state.list.concat({
                        key: Date.now(),
                        item: {...item, ratingCount: (item as any).valuations.length},
                        showRating: !!(state.showRating),
                        showImport: !!(state.showImport)
                    })
                });
            });
    }

    const fillListReducer$ = xs.merge(responseGetSetsApi$, responseSearchSetsApi$)
        .map(s => concat(clearSets$, fillListByResponse$(xs.of(s)))).flatten();

    return xs.merge(initReducer$, fillListReducer$);
}
