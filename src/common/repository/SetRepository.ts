import {Sources} from '../interfaces';
import xs, {Stream} from 'xstream';
import {GetSetsApi} from '../api/set/GetSets';
import dropRepeats from 'xstream/extra/dropRepeats';
import {SearchSetsApi} from '../api/set/SearchSets';
import {HttpRequest} from '../api/HttpRequest';
import {GetOwnSetsApi} from '../api/set/GetOwnSets';

interface ResponseSinks {
    [name: string]: Stream<any>;
}

interface RepositorySinks {
    HTTP: Stream<HttpRequest>;
    response: ResponseSinks;
}

export enum Type{
    OWN_SETS    = 'get-own-set',
    SET         = 'get-set',
    SEARCH      = 'search-set',
    ADD         = 'add-set',
    EDIT        = 'edit-set',
    UPDATE      = 'update-set',
    IMPORT      = 'import-set',
    DELETE      = 'delete-set'
}

export type Action = GetOwnSets | GetSet | Search | Add | Import | Edit | Delete;

export type GetOwnSets = {
    type: Type.OWN_SETS
};

export type GetSet = {
    type: Type.SET,
    setId: string
};

export type Search = {
    type: Type.SEARCH,
    search: {
        param: string,
        orderBy: OrderType,
        sortBy: SortType
    }
};

export type Add = {
    type: Type.ADD,
    set: object
};

export type Edit = {
    type: Type.EDIT,
    set: object
};

export type Import = {
    type: Type.IMPORT,
    setId: string
};

export type Delete = {
    type: Type.DELETE,
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

export function SetRepository(sources: Sources, action$: Stream<Action>): RepositorySinks {
    return {
        HTTP: requests(action$),
        response: responses(sources)
    };
}

function requests(action$: Stream<Action>): Stream<any> {

    function filterActionFromState$(type: string, compareFn: (prev: Action, now: Action) => boolean): Stream<any> {
        return action$
            .filter(action => action.type === type)
            .compose(dropRepeats(<SearchSetAction>(prev, now) => !compareFn(prev, now)));
    }

    // Search sets
    const searchSetRequest$ = filterActionFromState$(Type.SEARCH,
        (prev: Search, now: Search) => prev.search !== now.search)
        .map(state => state.search)
        .map(search => {
            return SearchSetsApi.buildRequest({
                param: encodeURIComponent(search.param),
                orderBy: search.orderBy,
                sort: search.sortBy
            });
        });

    // Get own sets
    const ownSetRequest$ = filterActionFromState$(Type.OWN_SETS,
        (prev: GetOwnSets, now: GetOwnSets) => prev.type !== now.type)
        .map(state => GetOwnSetsApi.request());

    // Get set by id
    const specificSetRequest$ = filterActionFromState$(Type.SET,
        (prev: GetSet, now: GetSet) => prev.setId !== now.setId)
        .map(action => GetSetsApi.request(action.setId));

    // Add set
    // Edit set
    // Update set
    // Delete set
    // Import set

    return xs.merge(ownSetRequest$, specificSetRequest$, searchSetRequest$);

}

function responses(sources: Sources): ResponseSinks {

    function responseHelper(id: string): Stream<any> {
        return sources.HTTP.select(id)
            .flatten()
            .map(({text}) => JSON.parse(text));
    }

    const getSetsApi$ = GetSetsApi.response(sources);
    const searchSetsApi$ = responseHelper(SearchSetsApi.ID);

    return {
        getSetsApi$,
        searchSetsApi$
    };

}
