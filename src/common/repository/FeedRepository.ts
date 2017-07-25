import { Sources } from '../interfaces';
import xs, { Stream } from 'xstream';
import { createGetRequest } from '../api/ApiHelper';
import { filterActionFromRequest$, RootRepositorySinks, RootResponseSinks as RootResponseSinks } from './Repository';

export enum RequestMethod {
    GET_OWN = 'get-own-feed',
    GET_BY_ID = 'get-feed-by-id'
}

export const FeedRepositoryAction = {

    GetOwn: () => ({
        type: RequestMethod.GET_OWN
    }),

    GetById: (id: String) => ({
        type: RequestMethod.GET_BY_ID,
        id: id
    })

};

export interface FeedRepositorySinks extends RootRepositorySinks {
    response: ResponseSinks
}

export interface ResponseSinks extends RootResponseSinks {
    getOwnFeedResponse$: Stream<any>;
    getByIdFeedResponse$: Stream<any>;
}

const API_URL = '/activity';


function requests(sources: Sources, action$: Stream<any>): Stream<any> {

    const getOwnFeed$ = filterActionFromRequest$(action$, RequestMethod.GET_OWN)
        .map(request => createGetRequest(API_URL + '/1', RequestMethod.GET_OWN));

    const getById$ = filterActionFromRequest$(action$, RequestMethod.GET_BY_ID)
        .map(({id}) => createGetRequest(API_URL + '/' + id + '/1', RequestMethod.GET_BY_ID));

    return xs.merge(getOwnFeed$, getById$);

}

function responses(sources: Sources): ResponseSinks {

    const {HTTP} = sources;

    const getOwnFeedResponse$ = HTTP.select(RequestMethod.GET_OWN)
        .flatten()
        .map(({text}) => JSON.parse(text));

    const getByIdFeedResponse$ = HTTP.select(RequestMethod.GET_BY_ID)
        .flatten()
        .map(({text}) => JSON.parse(text));

    return {
        getOwnFeedResponse$: getOwnFeedResponse$,
        getByIdFeedResponse$: getByIdFeedResponse$
    };

}

export function FeedRepository(sources: Sources, action$: Stream<any>): FeedRepositorySinks {
    return {
        HTTP: requests(sources, action$),
        response: responses(sources)
    };
}