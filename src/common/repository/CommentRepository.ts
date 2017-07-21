import {Sources} from '../interfaces';
import xs, {Stream} from 'xstream';
import {createGetRequest, createPostRequest} from '../api/ApiHelper';
import {RootRepositorySinks, RootResponseSinks as RootResponseSinks} from './Repository';

export enum RequestMethod {
    GET_BY_SET_ID = 'get-comments-by-set-id',
    ADD_COMMENT_TO_SET = 'add-comment-to-set'
}

export interface AddCommentModel {
    score: number;
    comment: string;
}

export type Action = GetCommentsBySetId;

export type GetCommentsBySetId = {
    type: RequestMethod.GET_BY_SET_ID,
    setId: string
};

export type AddCommentToSet = {
    type: RequestMethod.ADD_COMMENT_TO_SET,
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



    const getCommentsBySetId$ = filterActionFromState$(RequestMethod.GET_BY_SET_ID)
        .map(request => createGetRequest(API_URL + '/' + request.setId + '/evaluate'));

    const addCommentToSet$ = filterActionFromState$(RequestMethod.ADD_COMMENT_TO_SET)
        .map(request => createPostRequest(API_URL + '/' + request.setId + '/evaluate',
            request.comment as AddCommentModel,
            RequestMethod.ADD_COMMENT_TO_SET)
        );

    return xs.merge(getCommentsBySetId$, addCommentToSet$);

}

function responses(sources: Sources): ResponseSinks {

    const {HTTP} = sources;

    return {
        nix: xs.never()
    };

}
