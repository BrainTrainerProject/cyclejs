import {Sources} from '../interfaces';
import xs, {Stream} from 'xstream';
import {createGetRequest} from '../api/ApiHelper';
import {RootRepositorySinks, RootResponseSinks as RootResponseSinks} from './Repository';

export enum RequestMethod {
    GET_FEED = 'get-feed'
}

export type Action = GetFeed;

export type GetFeed = {
    type: RequestMethod.GET_FEED,
    setId: string
};

export interface ResponseSinks extends RootResponseSinks {
    getFeedResponse$: Stream<any>;
}

const API_URL = '/set';

export function FeedRepository(sources: Sources, action$: Stream<Action>): RootRepositorySinks {
    return {
        HTTP: requests(sources, action$),
        response: responses(sources)
    };
}

function requests(sources: Sources, action$: Stream<Action>): Stream<any> {

    function filterActionFromState$(type: RequestMethod): Stream<any> {
        return action$
            .filter(action => action.type === type);
    }

    const getFeed$ = filterActionFromState$(RequestMethod.GET_FEED)
        .map(request => createGetRequest(API_URL, RequestMethod.GET_FEED));

    return xs.merge(getFeed$);

}

function responses(sources: Sources): ResponseSinks {

    const {HTTP} = sources;

    return {
        getFeedResponse$: xs.never()
    };

}
