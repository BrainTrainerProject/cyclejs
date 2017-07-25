import { Sources } from '../interfaces';
import xs, { Stream } from 'xstream';
import { createGetRequest, createPostRequest } from '../api/ApiHelper';
import { filterActionFromRequest$, RootRepositorySinks, RootResponseSinks as RootResponseSinks } from './Repository';
import debounce from "xstream/extra/debounce";
import flattenConcurrently from "xstream/extra/flattenConcurrently";

export enum RequestMethod {
    GET_BY_ID = 'get-follower-by-id',
    CONCAT_FOLLOWER = 'concat-follower',
    FOLLOW_PROFILE = 'follow-profile',
    UN_FOLLOW_PROFILE = 'unfollow-profile'
}

export const FollowerRepositoryAction = {

    GetById: (id: string) => ({
        type: RequestMethod.GET_BY_ID,
        id: id
    }),

    FollowProfile: (profileId: string) => ({
        type: RequestMethod.FOLLOW_PROFILE,
        profileId: profileId
    }),

    UnFollowProfile: (profileId: string) => ({
        type: RequestMethod.UN_FOLLOW_PROFILE,
        profileId: profileId
    })

};

export interface FollowerRepositorySinks extends RootRepositorySinks {
    response: ResponseSinks
}

export interface ResponseSinks extends RootResponseSinks {
    followerResponse$: Stream<any>;
}


function requests(sources: Sources, action$: Stream<any>): Stream<any> {

    const getById$ = filterActionFromRequest$(action$, RequestMethod.GET_BY_ID)
        .map(({id}) => createGetRequest('/profile/' + id, RequestMethod.GET_BY_ID));

    const concatRequest$ = sources.HTTP.select(RequestMethod.GET_BY_ID)
        .flatten()
        .map(({text}) => JSON.parse(text))
        .map(res => res.follower)
        .filter(array => array.length > 0)
        .map(array => xs.of(array).map(id => createGetRequest('/profile/' + id, RequestMethod.CONCAT_FOLLOWER)))
        .flatten();

    const follow$ = filterActionFromRequest$(action$, RequestMethod.FOLLOW_PROFILE)
        .map(({profileId}) => createPostRequest('/profile/' + profileId + '/follow', {}, RequestMethod.FOLLOW_PROFILE));

    const unfollow$ = filterActionFromRequest$(action$, RequestMethod.UN_FOLLOW_PROFILE)
        .map(({profileId}) => createPostRequest('/profile/' + profileId + '/unfollow', {}, RequestMethod.UN_FOLLOW_PROFILE));

    return xs.merge(getById$, concatRequest$, follow$, unfollow$);

}

function responses(sources: Sources): ResponseSinks {

    const {HTTP} = sources;

    const followerResponse$ = HTTP.select(RequestMethod.CONCAT_FOLLOWER)
        .compose(flattenConcurrently)
        .filter(({text}) => !!text)
        .map(({text}) => JSON.parse(text))
        .fold((list, x) => list.concat(x), [])
        .compose(debounce(100));

    return {
        followerResponse$: followerResponse$
    };

}

export function FollowerRepository(sources: Sources, action$: Stream<any>): FollowerRepositorySinks {
    return {
        HTTP: requests(sources, action$),
        response: responses(sources)
    };
}