import {Sources} from '../interfaces';
import xs, {Stream} from 'xstream';
import {defaultResponseHelper, RootRepositorySinks, ResponseSinks} from './Repository';
import {createGetRequest, createPutRequest} from '../api/ApiHelper';

const API_URL = '/profile';

export enum RequestMethod {
    GET_OWN = 'get-profile',
    GET_BY_ID = 'get-profile-by-id',
    UPDATE = 'update-profile'
}

export type Request = GetOwnRequest | UpdateRequest;

export type GetOwnRequest = {
    type: RequestMethod.GET_OWN
};

export type GetByIdRequest = {
    type: RequestMethod.GET_BY_ID,
    userId: string
};

export type UpdateRequest = {
    type: RequestMethod.UPDATE,
    payload: {
        visibility: boolean,
        cardsPerSession: number,
        interval: number
    }
};

export function ProfileRepository(sources: Sources, request$: Stream<Request>): RootRepositorySinks {
    return {
        HTTP: requests(request$),
        response: responses(sources)
    };
}

function requests(request$: Stream<Request>): Stream<any> {

    function filterActionFromRequest$(type: string): Stream<any> {
        return request$
            .filter(action => action.type === type);
    }

    // Own profile
    const getOwnProfile$ = filterActionFromRequest$(RequestMethod.GET_OWN)
        .map(request => createGetRequest(API_URL, RequestMethod.GET_OWN));

    // Get by id
    const getProfileById$ = filterActionFromRequest$(RequestMethod.GET_BY_ID)
        .map(request => createGetRequest(API_URL + '/' + (request as GetByIdRequest).userId, RequestMethod.GET_BY_ID));

    // Update profile
    const updateProfile$ = filterActionFromRequest$(RequestMethod.UPDATE)
        .map(request => createPutRequest(API_URL, (request as UpdateRequest).payload));

    return xs.merge(getOwnProfile$, getProfileById$, updateProfile$);
}

function responses(sources: Sources): ResponseSinks {

    const defaultResponse = (id: string) => {
        return defaultResponseHelper(sources, id);
    };

    return {
        getOwnProfile$: defaultResponse(RequestMethod.GET_OWN),
        getProfileById$: defaultResponse(RequestMethod.GET_BY_ID),
        updateProfile$: defaultResponse(RequestMethod.UPDATE)
    };

}