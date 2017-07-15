'use strict';
import xs, {Stream} from 'xstream';
import {DOMSource, VNode} from '@cycle/dom';
import {StateSource} from 'cycle-onionify';
import ActionList, {State as ListState} from '../ActionList';
import isolate from '@cycle/isolate';
import {HTTPSource} from '@cycle/http';
import flattenSequentially from 'xstream/extra/flattenSequentially';
import {HttpRequest} from '../../../common/api/HttpRequest';
import SetsItem from './SetsItem';
import {SetService, SetServiceSinks} from './SetService';

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

    const setService: SetServiceSinks = SetService(sources, state$);

    const listSinks = isolate(ActionList, 'list')(sources, SetsItem);
    const reducer$ = reducer(sources, setService);

    return {
        ...listSinks,
        HTTP: setService.requests,
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

function reducer({HTTP}: Sources, service: SetServiceSinks): Stream<any> {

    const initReducer$ = xs.of((state) => {
        if (state) {
            return state;
        }
        return defaultState(state);
    });

    const response = service.response;
    const responseGetSetsApi$ = response.getSetsApi$;
    const responseSearchSetsApi$ = response.searchSetsApi$;

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

    const getSetReducer$ = fillListByResponse$(responseGetSetsApi$);
    const searchReducer$ = fillListByResponse$(responseSearchSetsApi$);

    return xs.merge(initReducer$, clearSets$, getSetReducer$, searchReducer$);
}
