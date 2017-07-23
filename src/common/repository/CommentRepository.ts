import { Sources } from '../interfaces';
import xs, { Stream } from 'xstream';
import { createGetRequest, createPostRequest } from '../api/ApiHelper';
import { filterActionFromRequest$, RootRepositorySinks, RootResponseSinks as RootResponseSinks } from './Repository';
import flattenConcurrently from "xstream/extra/flattenConcurrently";
import debounce from "xstream/extra/debounce";

export enum RequestMethod {
    GET_BY_SET_ID = 'get-comments-by-set-id',
    ADD_COMMENT_TO_SET = 'add-comment-to-set',
    GET_COMMENT_BY_ID = 'get-comment-by-id'
}

export const CommentRepositoryAction = {

    GetBySetId: (setId: string) => ({
        type: RequestMethod.GET_BY_SET_ID,
        setId: setId
    }),

    Add: (setId: string, comment: AddCommentModel) => ({
        type: RequestMethod.ADD_COMMENT_TO_SET,
        setId: setId,
        comment: comment
    })

};

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

const API_URL = '/set';

export interface ResponseSinks extends RootResponseSinks {
    getCommentBySetIdResponse$: Stream<any>;
}

export interface CommentRepositorySinks extends RootRepositorySinks {
    response: ResponseSinks
}

export function CommentRepository(sources: Sources, action$: Stream<Action>): CommentRepositorySinks {
    return {
        HTTP: requests(sources, action$),
        response: responses(sources)
    };
}

function requests(sources: Sources, action$: Stream<Action>): Stream<any> {

    // /api/valuation/59468275d0b321046c2522bc
    const getCommentsBySetId$ = filterActionFromRequest$(action$, RequestMethod.GET_BY_SET_ID)
        .map(request => createGetRequest(API_URL + '/' + request.setId, RequestMethod.GET_BY_SET_ID))
        .debug('GetCommentsBySetId$');

    function mapValuations$() {
        const responseFromSet$ = sources.HTTP.select(RequestMethod.GET_BY_SET_ID)
            .flatten()
            .map(res => {
                console.log(res);
                return res
            }).map(({text}) => JSON.parse(text));

        const getCommentEachRequest$ = responseFromSet$
            .map(set => set.valuations)
            .map(valuations => xs.fromArray(valuations))
            .flatten();

        const commentApiCall$ = getCommentEachRequest$.debug('GetEach$')
            .map(commentId => {
                console.log("CommentID ", commentId);

                return createGetRequest(
                    '/valuation/' + commentId,
                    RequestMethod.GET_COMMENT_BY_ID + commentId
                );
            });

        const buildApiCall$ = getCommentEachRequest$.debug('GetEach$')
            .map(commentId => {
                console.log("CommentID ", commentId);

                return createGetRequest(
                    '/valuation/' + commentId,
                    RequestMethod.GET_COMMENT_BY_ID + commentId
                );
            });

        return buildApiCall$;
    }

    const addCommentToSet$ = filterActionFromRequest$(action$, RequestMethod.ADD_COMMENT_TO_SET)
        .map(request => createPostRequest(API_URL + '/' + request.setId + '/evaluate',
            request.comment as AddCommentModel,
            RequestMethod.ADD_COMMENT_TO_SET)
        ).debug('AddCommentToSet$');

    return xs.merge(getCommentsBySetId$, addCommentToSet$, mapValuations$());

}

function responses(sources: Sources): ResponseSinks {

    const {HTTP} = sources;

    // Response notecards from set
    const getCommentBySetIdResponse$ = HTTP.select()
        .compose(flattenConcurrently)
        .filter(res => !!res.request.category)
        .filter(res => {
            const category = res.request.category;
            const idLength = RequestMethod.GET_COMMENT_BY_ID.length;
            return category.substr(0, idLength) === RequestMethod.GET_COMMENT_BY_ID && category.length > idLength;
        })
        .map(({text}) => JSON.parse(text))
        .fold((list, x) => list.concat(x), [])
        .compose(debounce(100));

    return {
        getCommentBySetIdResponse$: getCommentBySetIdResponse$ // ARRAY
    };

}
