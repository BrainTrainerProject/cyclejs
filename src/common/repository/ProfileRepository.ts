import { Sources } from '../interfaces';
import xs, { Stream } from 'xstream';
import { defaultResponseHelper, RootRepositorySinks, RootResponseSinks } from './Repository';
import { createGetRequest, createPutRequest } from '../api/ApiHelper';

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
    payload: UpdateProfileModel
};

interface UpdateProfileModel {
    visibility: boolean,
    cardsPerSession: number,
    interval: number
}

export const ProfileRepositoryActions = {

    GetOwn: () => ({
        type: RequestMethod.GET_OWN
    }),

    GetById: (userId: string) => ({
        type: RequestMethod.GET_BY_ID,
        userId: userId
    }),

    Edit: (profile: UpdateProfileModel) => ({
        type: RequestMethod.UPDATE,
        payload: profile
    })

};

export function ProfileRepository(sources: Sources, request$: Stream<Request>): RootRepositorySinks {
    return {
        HTTP: requests(request$),
        response: responses(sources)
    };
}

function requests(request$: Stream<Request>): Stream<any> {

    function filterActionFromRequest$(type: string): Stream<any> {
        return request$.filter(action => action.type === type);
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

function responses(sources: Sources): RootResponseSinks {

    const defaultResponse = (id: string) => {
        return defaultResponseHelper(sources, id);
    };

    return {
        getOwnProfile$: defaultResponse(RequestMethod.GET_OWN),
        getProfileById$: sources.HTTP.select(RequestMethod.GET_BY_ID).flatten().map(({text}) => {
            if (text === 'Profile is private') {
                return {private: true}
            } else {
                return JSON.parse(text)
            }
        }),
        updateProfile$: defaultResponse(RequestMethod.UPDATE)
    };

}