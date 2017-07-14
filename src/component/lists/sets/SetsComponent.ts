'use strict';
import xs, { Stream } from 'xstream';
import { DOMSource, VNode } from '@cycle/dom';
import { StateSource } from 'cycle-onionify';
import {default as SetsList, State as ListState } from '../ActionList';
import isolate from '@cycle/isolate';
import dropRepeats from 'xstream/extra/dropRepeats';
import { GetSetsApi } from '../../../common/api/set/GetSets';
import { HTTPSource } from '@cycle/http';
import flattenSequentially from 'xstream/extra/flattenSequentially';
import { SearchSetsApi } from '../../../common/api/set/SearchSets';
import { HttpRequest } from '../../../common/api/HttpRequest';
import SetsItem from './SetsItem';
import ActionList from '../ActionList';

export type ShowOwnSets = {
    type: 'own'
};

export type ShowSpecificSets = {
    type: 'specific',
    setId: string
};

export enum OrderType {
    DATE = 'date',
    RATING = 'rating'
}

export enum SortType{
    ASC = 'asc',
    DESC = 'desc'
}

export type ShowSearchedSets = {
    type: 'search',
    search: {
        param: string,
        orderBy: OrderType,
        sortBy: SortType
    }
};

export type ShowOptions = ShowOwnSets | ShowSpecificSets | ShowSearchedSets;

export type State = {
    show: ShowOptions
    list: ListState,
    page: number,
    limit: number,
    showRating: boolean,
    showImport: boolean
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

export default function SetComponent(sources: Sources): Sinks {

    console.log('SetComponents');
    const state$ = sources.onion.state$;

    const listSinks = isolate(ActionList, 'list')(sources, SetsItem);
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
        show: {
            type: 'search',
            search: {
                param: '',
                orderBy: OrderType.DATE,
                sortBy: SortType.DESC
            }
        } as ShowSearchedSets,
        list: [],
        page: 0,
        limit: 10,
        showRating: false,
        showImport: false
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
                    item: {...item, ratingCount: item.valuations.length},
                    showRating: !!(state.showRating),
                    showImport: !!(state.showImport)
                })
            }));
    }

    const getSetRecuder$ = fillListByResponse$(responseGetSetsApi$);
    const searchReducer$ = fillListByResponse$(responseSearchSetsApi$);

    return xs.merge(initReducer$, clearSets$, getSetRecuder$, searchReducer$);
}

function httpRequests$(state$: Stream<any>): Stream<any> {

    function filterActionFromState$(type: String, compareFn: (prev: ShowOptions, now: ShowOptions) => boolean): Stream<any> {
        return state$
            .map(state => state.show as ShowOptions)
            .filter(show => show.type === type)
            .compose(dropRepeats(<SearchSetAction>(prev, now) => compareFn(prev, now)));
    }

    const searchSetRequest$ = filterActionFromState$('search',
        (prev: ShowSearchedSets, now: ShowSearchedSets) => prev.search === now.search)
        .map(state => state.search)
        .map(search => {
            return SearchSetsApi.buildRequest({
                param: encodeURIComponent(search.param),
                orderBy: search.orderBy,
                sort: search.sortBy
            });
        });

    const ownSetRequest$ = filterActionFromState$('own',
        (prev: ShowOwnSets, now: ShowOwnSets) => prev.type === now.type)
        .map(state => GetSetsApi.buildRequest());

    const specificSetRequest$ = filterActionFromState$('byId',
        (prev: ShowSpecificSets, now: ShowSpecificSets) => prev.setId === now.setId)
        .map(action => GetSetsApi.buildRequest({
            setId: action.setId
        }));

    return xs.merge(ownSetRequest$, specificSetRequest$, searchSetRequest$);

}
