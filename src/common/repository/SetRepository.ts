import { Sources } from '../interfaces';
import xs, { Stream } from 'xstream';
import { OrderType } from '../OrderType';
import { SortType } from '../SortType';
import { createDeleteRequest, createGetRequest, createPostRequest, createPutRequest } from '../api/ApiHelper';
import { defaultResponseHelper, filterActionFromRequest$, RootRepositorySinks, RootResponseSinks } from './Repository';
import debounce from 'xstream/extra/debounce';
import dropRepeats from "xstream/extra/dropRepeats";

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

type Search = Action & {
    search: SearchParams
}

type SetAction = Action & {
    set: object
}

type SetIdAction = Action & {
    setId: string
}

type SetEditAction = SetAction & SetIdAction

export const SetRepositoryActions = {

    GetById: (setId: string): SetIdAction => ({
        type: ActionType.BY_ID,
        setId: setId
    }),

    GetOwnSets: (): Action => ({
        type: ActionType.OWN_SETS
    }),

    Search: (params: SearchParams): Search => ({
        type: ActionType.SEARCH,
        search: params
    }),

    Add: (set: object): SetAction => ({
        type: ActionType.ADD,
        set: set
    }),

    Edit: (setId: string, set: object): SetEditAction => ({
        type: ActionType.EDIT,
        setId: setId,
        set: set
    }),

    Delete: (setId: string): SetIdAction => ({
        type: ActionType.DELETE,
        setId: setId
    }),

    Import: (setId: string): SetIdAction => ({
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
    updateSet$: Stream<any>;
    deleteSet$: Stream<any>;
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
        .map(reqeust => createPutRequest(API_URL + '/' + reqeust.setId, reqeust.set, ActionType.EDIT));

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
        add$.compose(dropRepeats()),
        edit$,
        delete$.compose(dropRepeats()),
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
    const updateSet$ = defaultResponse(ActionType.UPDATE);
    const deleteSet$ = defaultResponse(ActionType.DELETE);

    return {
        getSetById$,
        getOwnSets$,
        search$,
        deleteSet$,
        updateSet$,
    };

}

export function SetRepository(sources: Sources, action$: Stream<Action>): SetRepositorySinks {
    return {
        HTTP: requests(action$.remember()),
        response: responses(sources)
    };
}
