import {Sources} from '../interfaces';
import xs, {Stream} from 'xstream';
import {OrderType} from '../OrderType';
import {SortType} from '../SortType';
import {createDeleteRequest, createGetRequest, createPostRequest, createPutRequest} from '../api/ApiHelper';
import {defaultResponseHelper, filterActionFromRequest$, RootRepositorySinks, RootResponseSinks} from './Repository';
import debounce from 'xstream/extra/debounce';

export enum RequestMethod {
    OWN_SETS = 'get-own-set',
    BY_ID = 'get-set-by-id',
    SEARCH = 'search-set',
    ADD = 'add-set',
    EDIT = 'edit-set',
    UPDATE = 'update-set',
    IMPORT = 'import-set',
    DELETE = 'delete-set'
}

export type Action = GetOwnSets | GetSet | Search | Add | Import | Edit | Delete;

interface AddSetModel {

}

export type GetOwnSets = {
    type: RequestMethod.OWN_SETS
};

export type GetSet = {
    type: RequestMethod.BY_ID,
    setId: string
};

export type SearchParams = {
    param: string,
    orderBy: OrderType,
    sortBy: SortType
};

export type Search = {
    type: RequestMethod.SEARCH,
    search: SearchParams
};

export type Add = {
    type: RequestMethod.ADD,
    set: AddSetModel
};

export type Edit = {
    type: RequestMethod.EDIT,
    set: object
};

export type Import = {
    type: RequestMethod.IMPORT,
    setId: string
};

export type Delete = {
    type: RequestMethod.DELETE,
    setId: string
};

export interface SetRepositorySinks extends RootRepositorySinks {
    response: SetRepositoryResponse;
}

export interface SetRepositoryResponse extends RootResponseSinks {
    getSetById$: Stream<any>;
    getOwnSets$: Stream<any>;
    search$: Stream<any>;
}

const API_URL = '/set';

export function SetRepository(sources: Sources, action$: Stream<Action>): SetRepositorySinks {
    return {
        HTTP: requests(action$),
        response: responses(sources)
    };
}

function buildSearchUrl(props: SearchParams): string {
    let url = '/set/search?';
    if (props.param) {
        url += 'param=';
        url += props.param;
    }
    if (props.orderBy) {
        url.concat((props.param) ? '&orderBy=' : 'orderBy=');
        url.concat(props.orderBy);
    }
    if (props.sortBy) {
        url.concat((props.param) ? '&sort=' : 'sort=');
        url.concat(props.sortBy);
    }
    return url;
}

function requests(action$: Stream<Action>): Stream<any> {

    // Search sets
    const searchSetRequest$ = filterActionFromRequest$(action$, RequestMethod.SEARCH)
        .map(state => state.search)
        .compose(debounce(10))
        .map(search => createGetRequest(buildSearchUrl(search), RequestMethod.SEARCH));

    // Get own sets
    const ownSetRequest$ = filterActionFromRequest$(action$, RequestMethod.OWN_SETS)
        .map(state => createGetRequest(API_URL, RequestMethod.OWN_SETS));

    // Get set by id
    const specificSetRequest$ = filterActionFromRequest$(action$, RequestMethod.BY_ID)
        .map(action => createGetRequest(API_URL + '/' + action.setId, RequestMethod.BY_ID));

    // Add set
    const add$ = filterActionFromRequest$(action$, RequestMethod.ADD)
        .map(action => action.set as AddSetModel)
        .map(set => createPostRequest(API_URL, set, RequestMethod.ADD));

    // Edit set
    const edit$ = filterActionFromRequest$(action$, RequestMethod.EDIT)
        .map(action => action.set)
        .map(set => createPutRequest(API_URL, set, RequestMethod.EDIT));

    // Delete set
    const delete$ = filterActionFromRequest$(action$, RequestMethod.DELETE)
        .map(action => action.setId)
        .map(setId => createDeleteRequest(API_URL + '/' + setId, RequestMethod.DELETE));

    // Import set
    const import$ = filterActionFromRequest$(action$, RequestMethod.IMPORT)
        .map(request => createGetRequest(API_URL + '/' + request.setId + '/import', RequestMethod.IMPORT));

    return xs.merge(
        ownSetRequest$,
        specificSetRequest$,
        searchSetRequest$,
        add$, edit$, delete$,
        import$
    ).debug('SetRepository Requests');

}

function responses(sources: Sources): SetRepositoryResponse {

    const defaultResponse = (id: string) => {
        return defaultResponseHelper(sources, id);
    };

    const getSetById$ = defaultResponse(RequestMethod.BY_ID);
    const getOwnSets$ = defaultResponse(RequestMethod.OWN_SETS);
    const search$ = defaultResponse(RequestMethod.SEARCH);

    return {
        getSetById$,
        getOwnSets$,
        search$
    };

}
