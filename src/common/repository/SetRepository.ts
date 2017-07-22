import { Sources } from '../interfaces';
import xs, { Stream } from 'xstream';
import { OrderType } from '../OrderType';
import { SortType } from '../SortType';
import { createDeleteRequest, createGetRequest, createPostRequest, createPutRequest } from '../api/ApiHelper';
import { defaultResponseHelper, filterActionFromRequest$, RootRepositorySinks, RootResponseSinks } from './Repository';
import debounce from 'xstream/extra/debounce';

enum ActionType {
    OWN_SETS = 'get-own-set',
    BY_ID = 'get-set-by-id',
    SEARCH = 'search-set',
    ADD = 'add-set',
    EDIT = 'edit-set',
    UPDATE = 'update-set',
    IMPORT = 'import-set',
    DELETE = 'delete-set'
}

type Action = {
    type: ActionType;
}

export const SetRepositoryAction = {

    GetSet: (setId: string) => ({
        type: ActionType.BY_ID,
        setId: setId
    }),

    GetOwnSets: () => ({
        type: ActionType.OWN_SETS
    }),

    Search: (params: SearchParams) => ({
        type: ActionType.SEARCH,
        search: params
    }),

    Add: (set: object) => ({
        type: ActionType.ADD,
        set: set
    }),

    Edit: (set: object) => ({
        type: ActionType.EDIT,
        set: set
    }),

    Delete: (setId: string) => ({
        type: ActionType.DELETE,
        setId: setId
    }),

    Import: (setId: string) => ({
        type: ActionType.IMPORT,
        setId: setId
    })

};

export type SearchParams = {
    param: string,
    orderBy: OrderType,
    sortBy: SortType
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
    const searchSetRequest$ = filterActionFromRequest$(action$, ActionType.SEARCH)
        .map(state => state.search)
        .compose(debounce(10))
        .map(search => createGetRequest(buildSearchUrl(search), ActionType.SEARCH));

    // Get own sets
    const ownSetRequest$ = filterActionFromRequest$(action$, ActionType.OWN_SETS)
        .map(state => createGetRequest(API_URL, ActionType.OWN_SETS));

    // Get set by id
    const specificSetRequest$ = filterActionFromRequest$(action$, ActionType.BY_ID)
        .map(action => createGetRequest(API_URL + '/' + action.setId, ActionType.BY_ID));

    // Add set
    const add$ = filterActionFromRequest$(action$, ActionType.ADD)
        .map(action => action.set)
        .map(set => createPostRequest(API_URL, set, ActionType.ADD));

    // Edit set
    const edit$ = filterActionFromRequest$(action$, ActionType.EDIT)
        .map(action => action.set)
        .map(set => createPutRequest(API_URL, set, ActionType.EDIT));

    // Delete set
    const delete$ = filterActionFromRequest$(action$, ActionType.DELETE)
        .map(action => action.setId)
        .map(setId => createDeleteRequest(API_URL + '/' + setId, ActionType.DELETE));

    // Import set
    const import$ = filterActionFromRequest$(action$, ActionType.IMPORT)
        .map(request => createGetRequest(API_URL + '/' + request.setId + '/import', ActionType.IMPORT));

    return xs.merge(
        ownSetRequest$,
        specificSetRequest$,
        searchSetRequest$,
        add$, edit$, delete$,
        import$
    );

}

function responses(sources: Sources): SetRepositoryResponse {

    const defaultResponse = (id: string) => {
        return defaultResponseHelper(sources, id);
    };

    const getSetById$ = defaultResponse(ActionType.BY_ID);
    const getOwnSets$ = defaultResponse(ActionType.OWN_SETS);
    const search$ = defaultResponse(ActionType.SEARCH);

    return {
        getSetById$,
        getOwnSets$,
        search$
    };

}

export function SetRepository(sources: Sources, action$: Stream<Action>): SetRepositorySinks {
    return {
        HTTP: requests(action$.remember()),
        response: responses(sources)
    };
}
