import xs, { Stream } from 'xstream';
import { DOMSource, VNode } from '@cycle/dom';
import { StateSource } from 'cycle-onionify';
import {default as SetsList, State as ListState } from './SetsList';
import isolate from '@cycle/isolate';
import dropRepeats from 'xstream/extra/dropRepeats';
import { GetSetsApi } from '../../common/api/set/GetSets';
import { HTTPSource } from '@cycle/http';
import flattenSequentially from 'xstream/extra/flattenSequentially';
import { SearchSetsApi } from '../../common/api/set/SearchSets';
import { HttpRequest } from '../../common/api/HttpRequest';

export type OwnerSetAction = {
    type: 'own'
};

export type SpecificSetAction = {
    type: 'byId',
    setId: string
};

export enum OrderType {
    DATE = ':date',
    RATING = ':rating'
}

export enum SortType{
    ASC = ':asc',
    DESC = ':desc'
}

export type SearchSetAction = {
    type: 'search',
    search: {
        param: string,
        orderBy: OrderType,
        sort: SortType
    }
};

export type ListAction = OwnerSetAction | SpecificSetAction | SearchSetAction;

export type State = {
    action: ListAction
    list: ListState,
    page: number,
    limit: number
};

export type ItemClickAction = {
    type: 'click',
    item: object
};

export type ImportClickAction = {
    type: 'import',
    item: object
};

export type Action = ItemClickAction | ImportClickAction;

export type Reducer = (prev?: State) => State | undefined;

export type Sources = {
    DOM: DOMSource;
    HTTP: HTTPSource;
    onion: StateSource<State>;
};

export type Sinks = {
    DOM: Stream<VNode>;
    HTTP: Stream<HttpRequest>;
    action: Stream<Action>;
    onion: Stream<Reducer>;
};

export default function SetsComponent(sources: Sources): Sinks {

    console.log('SetComponents');
    const state$ = sources.onion.state$.debug('SetsComponent STATE');

    const listSinks = isolate(SetsList, 'list')(sources);
    const reducer$ = reducer(sources);

    return {
        ...listSinks,
        HTTP: httpRequests$(state$),
        onion: reducer$
    };
}

function defaultState(state: State): State {
    return {
        ...state,
        action: {
            type: 'search',
            search: {
                param: '',
                orderBy: OrderType.DATE,
                sort: SortType.DESC
            }
        } as SearchSetAction,
        list: [],
        page: 0,
        limit: 10
    };
}

function reducer({HTTP}: Sources): Stream<any> {

    const initReducer$ = xs.of((state) => {
        if (state) {
            return state;
        }
        return defaultState(state);
    });

    function responseHelper(id: string): Stream<any> {
        return HTTP.select(id)
            .flatten()
            .map(({text}) => JSON.parse(text));
    }

    const responseGetSetsApi$ = responseHelper(GetSetsApi.ID);
    const responseSearchSetsApi$ = responseHelper(SearchSetsApi.ID);

    const clearSets$ = xs.merge(responseGetSetsApi$, responseSearchSetsApi$)
        .map(t => (state) => ({
            ...state,
            list: []
        }));

    function fillListByResponse$(stream$: Stream<any>): Stream<any> {
        return stream$.map(array => xs.fromArray(array))
            .compose(flattenSequentially)
            .map(item => (state) => ({
                ...state,
                list: state.list.concat({
                    key: Date.now(),
                    ...item
                })
            }));
    }

    const getSetRecuder$ = fillListByResponse$(responseGetSetsApi$);
    const searchReducer$ = fillListByResponse$(responseSearchSetsApi$);

    return xs.merge(initReducer$, clearSets$, getSetRecuder$, searchReducer$);
}

function httpRequests$(state$: Stream<any>): Stream<any> {

    function filterActionFromState$(type: String, compareFn: (prev: ListAction, now: ListAction) => boolean): Stream<any> {
        return state$
            .map(state => state.action)
            .filter(action => action.type === type)
            .compose(dropRepeats(<SearchSetAction>(prev, now) => compareFn(prev, now)));
    }

    const searchSetsRequest$ = filterActionFromState$('search',
        (prev: SearchSetAction, now: SearchSetAction) => prev.search === now.search)
        .map(state => state.search)
        .map(search => SearchSetsApi.buildRequest({
            param: search.param,
            orderBy: search.orderBy,
            sort: search.sort
        }));

    const ownSetsRequest$ = filterActionFromState$('own',
        (prev: OwnerSetAction, now: OwnerSetAction) => prev.type === now.type)
        .map(state => GetSetsApi.buildRequest());

    const specificSetRequest$ = filterActionFromState$('byId',
        (prev: SpecificSetAction, now: SpecificSetAction) => prev.setId === now.setId)
        .map(action => GetSetsApi.buildRequest({
            setId: action.setId
        }));

    return xs.merge(ownSetsRequest$, specificSetRequest$, searchSetsRequest$);

}
