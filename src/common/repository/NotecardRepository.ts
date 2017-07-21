import {Sources} from '../interfaces';
import xs, {Stream} from 'xstream';
import {createDeleteRequest, createGetRequest, createPostRequest, createPutRequest} from '../api/ApiHelper';
import {defaultResponseHelper, RootRepositorySinks, RootResponseSinks as RootResponseSinks} from './Repository';
import flattenConcurrently from 'xstream/extra/flattenConcurrently';
import debounce from 'xstream/extra/debounce';

export enum RequestMethod {
    BY_ID = 'get-notecard-by-id',
    GET_NOTECARDS_FROM_SET = 'get-notecards-by-set',
    ADD_TO_SET = 'add-notecard-to-set',
    EDIT = 'edit-notecard',
    DELETE = 'delete-notecard'
}

export type Action = GetById | GetNotecardsFromSet | AddToSet | Edit | Delete;

export type GetById = {
    type: RequestMethod.BY_ID,
    notecardId: string
};

export type GetNotecardsFromSet = {
    type: RequestMethod.GET_NOTECARDS_FROM_SET,
    setId: string
};

export type AddToSet = {
    type: RequestMethod.ADD_TO_SET,
    setId: string,
    notecard: NotecardEntity
};

export type Edit = {
    type: RequestMethod.EDIT,
    notecardId: string,
    notecard: NotecardEntity
};

export type Delete = {
    type: RequestMethod.DELETE,
    notecardId: string
};

export interface ResponseSinks extends RootResponseSinks {
    getNotecardsFromSet$: Stream<any>;
}

const API_URL = '/notecard';

export function NotecardRepository(sources: Sources, action$: Stream<Action>): RootRepositorySinks {
    return {
        HTTP: requests(sources, action$),
        response: responses(sources)
    };
}

interface NotecardEntity {
    title: string;
    task: string;
    answer: string;
}

function requests(sources: Sources, action$: Stream<Action>): Stream<any> {
    // TODO überrüfen was für eine Action hier ankommt
    function filterActionFromState$(type: RequestMethod): Stream<any> {
        return action$
            .map(action => {
                console.log('NR - Action Recevied: ', action);
                return action;
            })
            .filter(action => action.type === type);
    }

    // Get by id
    const getById$ = filterActionFromState$(RequestMethod.BY_ID)
        .map(request => createGetRequest(API_URL + '/' + request.notecardId, RequestMethod.BY_ID));

    // Get notecards from set
    const getNotecardsFromSet$ = filterActionFromState$(RequestMethod.GET_NOTECARDS_FROM_SET)
        .map(request => {
            console.log(request);
            return request;
        })
        .map(request => createGetRequest('/set/' + (request as GetNotecardsFromSet).setId,
            RequestMethod.GET_NOTECARDS_FROM_SET)
        ).debug('NR - GET NOTECARDS FROM SET');

    // Get from sets array
    const getNotecardsFromSetArray$ = defaultResponseHelper(sources, RequestMethod.GET_NOTECARDS_FROM_SET)
        .map(response => response.notecard)
        .map(notecards => xs.fromArray(notecards)
            .map(id => createGetRequest(API_URL + '/' + id, RequestMethod.BY_ID + id))
        ).flatten()
        .debug('NR - GET NOTECAARD FROM ARRAY');

    // Add to set
    const addToSet$ = filterActionFromState$(RequestMethod.ADD_TO_SET)
        .map(request => [request.setId, request.notecard])
        .map(([setId, notecard]) => createPostRequest(API_URL + '/set/' + setId, notecard, RequestMethod.ADD_TO_SET));

    // Edit notecard
    const edit$ = filterActionFromState$(RequestMethod.EDIT)
        .map(request => [request.notecardId, request.notecard])
        .map(([id, notecard]) => createPutRequest(API_URL + '/' + id, notecard, RequestMethod.EDIT));

    // Delete notecard
    const delete$ = filterActionFromState$(RequestMethod.DELETE)
        .map(request => createDeleteRequest(API_URL + '/' + request.notecardId, RequestMethod.DELETE));

    return xs.merge(getById$, getNotecardsFromSet$, getNotecardsFromSetArray$, addToSet$, edit$, delete$);

}

function responses(sources: Sources): ResponseSinks {

    const {HTTP} = sources;

    // Response notecards from set
    const getNotecardsFromSet$ = HTTP.select()
        .compose(flattenConcurrently)
        .filter(res => !!res.request.category)
        .filter(res => {

            console.log('RES');
            console.log(res.request.category);

            const category = res.request.category;
            const idLength = RequestMethod.BY_ID.length;
            return category.substr(0, idLength) === RequestMethod.BY_ID && category.length > idLength;
        })
        .map(({text}) => JSON.parse(text))
        .fold((list, x) => list.concat(x), [])
        .compose(debounce(100))
        .debug('NR - Response Get NOTECARDS FROM SET');

    return {
        getNotecardsFromSet$
    };

}
