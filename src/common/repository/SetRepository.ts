import {Sources} from '../interfaces';
import xs, {Stream} from 'xstream';
import {GetSetsApi} from '../api/set/GetSets';
import dropRepeats from 'xstream/extra/dropRepeats';
import {SearchSetsApi} from '../api/set/SearchSets';
import {HttpRequest} from '../api/HttpRequest';
import {OrderType} from '../OrderType';
import {SortType} from '../SortType';
import {createGetRequest2} from '../api/ApiHelper';
import {defaultResponseHelper} from './RepositoryInterfaces';

interface ResponseSinks {
    [name: string]: Stream<any>;
}

export interface Sinks {
    HTTP: Stream<HttpRequest>;
    response: ResponseSinks;
}

export enum Type {
    OWN_SETS = 'get-own-set',
    SET = 'get-set',
    SEARCH = 'search-set',
    ADD = 'add-set',
    EDIT = 'edit-set',
    UPDATE = 'update-set',
    IMPORT = 'import-set',
    DELETE = 'delete-set'
}

export type Action = GetOwnSets | GetSet | Search | Add | Import | Edit | Delete;

export type GetOwnSets = {
    type: Type.OWN_SETS
};

export type GetSet = {
    type: Type.SET,
    setId: string
};

export type SearchParams = {
    param: string,
    orderBy: OrderType,
    sortBy: SortType
};

export type Search = {
    type: Type.SEARCH,
    search: SearchParams
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

const API_URL = '/set';

export function SetRepository(sources: Sources, action$: Stream<Action>): Sinks {
    return {
        HTTP: requests(action$),
        response: responses(sources)
    };
}

function requests(action$: Stream<Action>): Stream<any> {

    console.log("Request Call");
    // TODO condition können auch weg, da die State sich nicht ständig ändert!!!
    interface RequestProps {
        type: string;
        condition: (prev: any, now: any) => boolean;
    }

    function filterActionFromState$(props: RequestProps): Stream<any> {
        return action$
            .filter(action => action.type === props.type)
            .compose(dropRepeats((prev, now) => !props.condition(prev, now)));
    }

    // Search sets
    const searchSetRequest$ = filterActionFromState$({
        type: Type.SEARCH,
        condition: (prev: Search, now: Search) => true
    }).map(state => state.search)
        .map(search => {
            console.log("Search xxx")
            console.log(search)
            return SearchSetsApi.buildRequest({
                param: encodeURIComponent(search.param),
                orderBy: search.orderBy,
                sort: search.sortBy
            });
        }).debug("Search Reducer§");

    // Get own sets
    const ownSetRequest$ = filterActionFromState$({
        type: Type.OWN_SETS,
        condition: (prev: GetOwnSets, now: GetOwnSets) => prev.type !== now.type
    }).map(state => createGetRequest2(API_URL, 'get-own-sets'));

    // Get set by id
    const specificSetRequest$ = filterActionFromState$({
        type: Type.SET,
        condition: (prev: GetSet, now: GetSet) => prev.setId !== now.setId
    }).map(action => createGetRequest2(API_URL + '/' + action.setId, 'get-specific-set'));

    // Add set
    // Edit set
    // Update set
    // Delete set
    // Import set

    return xs.merge(ownSetRequest$, specificSetRequest$, searchSetRequest$);

}

function responses(sources: Sources): ResponseSinks {

    const defaultResponse = (id: string) => {
        return defaultResponseHelper(sources, id);
    };

    const getSetsApi$ = GetSetsApi.response(sources);
    const searchSetsApi$ = defaultResponse(SearchSetsApi.ID);

    const set$ = xs.never();
    const search$ = xs.never();
    const ownSets$ = xs.never();

    return {
        getSetsApi$,
        searchSetsApi$
    };

}
