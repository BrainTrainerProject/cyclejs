import xs, { Stream } from 'xstream';
import { div, DOMSource, p, VNode } from '@cycle/dom';
import { StateSource } from 'cycle-onionify';
import { ListState, StateList } from '../StateList';
import isolate from '@cycle/isolate';
import { HTTPSource } from '@cycle/http';
import flattenSequentially from 'xstream/extra/flattenSequentially';
import { HttpRequest } from '../../../common/api/HttpRequest';
import {
    SearchParams,
    SetRepository,
    SetRepositoryAction,
    SetRepositorySinks
} from '../../../common/repository/SetRepository';
import concat from 'xstream/extra/concat';
import { Utils } from '../../../common/Utils';
import { CardItem } from '../CardItem';

export enum ActionType {
    OWN = 'own',
    BY_ID = 'byId',
    SEARCH = 'search'
}

interface Action {
    type: ActionType
}

export const SetListAction = {

    GetOwnSets: (): Action => ({
        type: ActionType.OWN
    }),

    GetSetsById: (setId: string): Action & { setId: string } => ({
        type: ActionType.BY_ID,
        setId: setId
    }),

    Search: (search: SearchParams): Action & { search: SearchParams } => ({
        type: ActionType.SEARCH,
        search: search
    })

};

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

function listView(items$): Stream<VNode> {

    const loading$ = xs.of(div('.ui.column', p(['Loading...'])));

    const emptyList$ = items$
        .filter(items => !items || (items && items.length === 0))
        .mapTo(div('.ui.column', p(['Keine Einträge vorhanden'])));

    const list$ = items$
        .filter(items => (items && items.length > 0))
        .map(items => div('.ui.three.column.doubling.stackable.grid',
            items
            )
        );

    return xs.merge(loading$, emptyList$, list$) as Stream<VNode>
}

export default function SetListComponent(sources: Sources, action$: Stream<Action>): Sinks {

    const importProxy$: Stream<Action> = xs.create();
    const listActions$ = xs.merge(listIntent(action$), importProxy$).remember();
    const setRepository: SetRepositorySinks = SetRepository(sources as any, listActions$ as any);

    const listSinks = isolate(StateList, 'list')(sources, CardItem);
    const reducer$ = reducer(intent(setRepository));

    const itemClick$ = listSinks.callback$
        .filter(callback => callback.type === 'click')
        .map(callback => callback.item);

    const importClick$ = listSinks.callback$
        .filter(callback => callback.type === 'import')
        .map(callback => callback.item);

    const importAction$ = importClick$
        .map(item => SetRepositoryAction.Import(item._id));
    importProxy$.imitate(importAction$);

    return {
        DOM: listView(listSinks.DOM),
        HTTP: setRepository.HTTP,
        onion: reducer$,
        itemClick$: itemClick$,
        importClick$: importClick$
    };
}

function intent(setRepository: SetRepositorySinks): any {
    const response = setRepository.response;
    return {
        showOwnSets$: response.getOwnSets$,
        showSetById$: response.getSetById$,
        showSearchSets$: response.search$
    };
}

function listIntent(action$: Stream<Action>): Stream<any> {

    function filterType(type: ActionType): Stream<any> {
        return action$
            .filter(action => action.type === type);
    }

    const ownSetsAction$ = filterType(ActionType.OWN)
        .map(action => SetRepositoryAction.GetOwnSets);

    const getSetAction$ = filterType(ActionType.BY_ID)
        .map(action => SetRepositoryAction.GetSet(action.setId));

    const searchAction$ = filterType(ActionType.SEARCH)
        .map(action => SetRepositoryAction.Search(action.search));

    return xs.merge(ownSetsAction$, getSetAction$, searchAction$);

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
