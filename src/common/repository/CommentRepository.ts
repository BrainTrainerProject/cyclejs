import {Sources} from '../interfaces';
import xs, {Stream} from 'xstream';
import {createGetRequest, createPostRequest} from '../api/ApiHelper';
import { filterActionFromRequest$, RootRepositorySinks, RootResponseSinks as RootResponseSinks } from './Repository';

export enum RequestMethod {
    GET_BY_SET_ID = 'get-comments-by-set-id',
    ADD_COMMENT_TO_SET = 'add-comment-to-set'
}

export interface AddCommentModel {
    score: number;
    comment: string;
}

export type Action = GetCommentsBySetId | AddCommentToSet

export type GetCommentsBySetId = {
    type: RequestMethod.GET_BY_SET_ID,
    setId: string
};

export type AddCommentToSet = {
    type: RequestMethod.ADD_COMMENT_TO_SET,
    setId: string,
    comment: AddCommentModel
};

export interface ResponseSinks extends RootResponseSinks {
    getCommentBySetIdResponse$: Stream<any>;
}

const API_URL = '/set';

export function CommentRepository(sources: Sources, action$: Stream<Action>): RootRepositorySinks {
    return {
        HTTP: requests(sources, action$),
        response: responses(sources)
    };
}

function requests(sources: Sources, action$: Stream<Action>): Stream<any> {

    const getCommentsBySetId$ = filterActionFromRequest$(action$, RequestMethod.GET_BY_SET_ID)
        .map(request => createGetRequest(API_URL + '/' + request.setId + '/evaluate'))
        .debug('GetCommentsBySetId$');

    const addCommentToSet$ = filterActionFromRequest$(action$, RequestMethod.ADD_COMMENT_TO_SET)
        .map(request => createPostRequest(API_URL + '/' + request.setId + '/evaluate',
            request.comment as AddCommentModel,
            RequestMethod.ADD_COMMENT_TO_SET)
        ).debug('AddCommentToSet$');

    return xs.merge(getCommentsBySetId$, addCommentToSet$);

}

function responses(sources: Sources): ResponseSinks {

    const {HTTP} = sources;

    return {
        getCommentBySetIdResponse$: xs.never()
    };

}
