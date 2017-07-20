import {Sources} from '../interfaces';
import xs, {Stream} from 'xstream';
import {defaultResponseHelper, RepositorySinks, ResponseSinks} from './RepositoryInterfaces';
import {createGetRequest2, createPostRequest} from '../api/ApiHelper';

const API_URL = '/profile';

export enum RequestType {
    GET_OWN = 'get-profile',
    GET_BY_ID = 'get-profile-by-id',
    UPDATE = 'update-profile'
}

export type Request = GetOwnRequest | UpdateRequest;

export type GetOwnRequest = {
    type: RequestType.GET_OWN
};

export type GetByIdRequest = {
    type: RequestType.GET_BY_ID,
    userId: string
};

export type UpdateRequest = {
    type: RequestType.UPDATE,
    payload: {
        visibility: boolean,
        cardsPerSession: number,
        interval: number
    }
};

export function ProfileRepository(sources: Sources, request$: Stream<Request>): RepositorySinks {
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
    const getOwnProfile$ = filterActionFromRequest$(RequestType.GET_OWN)
        .map(request => createGetRequest2(API_URL, RequestType.GET_OWN));

    // Get by id
    const getProfileById$ = filterActionFromRequest$(RequestType.GET_BY_ID)
        .map(request => createGetRequest2(API_URL + '/' + (request as GetByIdRequest).userId, RequestType.GET_BY_ID));

    // Update profile
    const updateProfile$ = filterActionFromRequest$(RequestType.UPDATE)
        .map(request => createPostRequest(RequestType.UPDATE, API_URL, (request as UpdateRequest).payload));

    return xs.merge(getOwnProfile$, getProfileById$, updateProfile$);
}

function responses(sources: Sources): ResponseSinks {

    const defaultResponse = (id: string) => {
        return defaultResponseHelper(sources, id);
    };

    return {
        getOwnProfile$: defaultResponse(RequestType.GET_OWN),
        getProfileById$: defaultResponse(RequestType.GET_BY_ID),
        updateProfile$: defaultResponse(RequestType.UPDATE)
    };

}