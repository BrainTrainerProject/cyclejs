import { Sources } from '../interfaces';
import xs, { Stream } from 'xstream';
import { createGetRequest, createPostRequest } from '../api/ApiHelper';
import { defaultResponseHelper, filterActionFromRequest$, RootRepositorySinks, RootResponseSinks } from './Repository';
import dropRepeats from "xstream/extra/dropRepeats";

enum ActionType {
    PRACTISE = 'practise',
    PRACTISE_BY_AMOUNT = 'random-practise',
    PRACTISE_BY_SET = 'practise-by-set',
    PRACTISE_BY_SET_AMOUNT = 'asdasd',
    EVALUATE = 'evaluate-practise'
}

type Action = {
    type: ActionType;
}

type NumberAction = Action & {
    amount: number
}

type SetIdAction = Action & {
    setId: string
}

type EvaluateAction = Action & {
    evaluate: { notecard: string, success: boolean }[]
}

type PractiseRepositoryAction = Action | Action & NumberAction | Action & NumberAction & SetIdAction | EvaluateAction

export const PractiseRepositoryActions = {

    Practise: (): Action => ({
        type: ActionType.PRACTISE,
    }),

    PractiseByAmount: (amount: number): Action & NumberAction => ({
        type: ActionType.PRACTISE_BY_AMOUNT,
        amount: amount
    }),

    PractiseBySet: (setId: string): Action & SetIdAction => ({
        type: ActionType.PRACTISE_BY_SET,
        setId: setId
    }),

    PractiseBySetAmount: (setId: string, amount: number): Action & NumberAction & SetIdAction => ({
        type: ActionType.PRACTISE_BY_SET_AMOUNT,
        setId: setId,
        amount: amount
    }),

    Evaluate: (evaluate: { notecard: string, success: boolean }[]): EvaluateAction => ({
        type: ActionType.EVALUATE,
        evaluate: evaluate
    })


};

export interface PractiseRepositorySinks extends RootRepositorySinks {
    response: PractiseRepositoryResponse;
}

export interface PractiseRepositoryResponse extends RootResponseSinks {
    getPractise$: Stream<any>
    getPractiseByAmount$: Stream<any>
    getPractiseBySet$: Stream<any>
    getPractiseBySetAmount$: Stream<any>
    getEvaluate$: Stream<any>
}

const API_URL = '/practise';

function requests(action$: Stream<Action>): Stream<any> {

    // GET /practice
    const practise$ = filterActionFromRequest$(action$, ActionType.PRACTISE)
        .map(request => createGetRequest(API_URL, ActionType.PRACTISE));

    // GET /practice/:cardsPerSession
    const practiseByAmount$ = filterActionFromRequest$(action$, ActionType.PRACTISE_BY_AMOUNT)
        .map(request => createGetRequest(API_URL + '/' + request.total, ActionType.PRACTISE_BY_AMOUNT));

    // GET /practice/set/:id
    const practiseBySet$ = filterActionFromRequest$(action$, ActionType.PRACTISE_BY_SET)
        .map(request => createGetRequest(API_URL + '/set/' + request.setId, ActionType.PRACTISE_BY_SET));

    // GET /practice/set/:id/:cardsPerSession
    const practiseBySetAmount$ = filterActionFromRequest$(action$, ActionType.PRACTISE_BY_SET_AMOUNT)
        .map(({setId, amount}) => createGetRequest(API_URL + '/set/' + setId + "/" + amount, ActionType.PRACTISE_BY_SET_AMOUNT));

    // POST /practice/evaluate
    const evaluate$ = filterActionFromRequest$(action$, ActionType.EVALUATE)
        .map(({evaluate}) => createPostRequest(API_URL + '/evaluate', evaluate, ActionType.EVALUATE));

    return xs.merge(
        practise$,
        practiseByAmount$,
        practiseBySet$,
        practiseBySetAmount$,
        evaluate$.compose(dropRepeats())
    );

}

function responses(sources: Sources): PractiseRepositoryResponse {

    const defaultResponse = (id: string) => {
        return defaultResponseHelper(sources, id);
    };

    const getPractise$ = defaultResponse(ActionType.PRACTISE);
    const getPractiseByAmount$ = defaultResponse(ActionType.PRACTISE_BY_AMOUNT);
    const getPractiseBySet$ = defaultResponse(ActionType.PRACTISE_BY_SET);
    const getPractiseBySetAmount$ = defaultResponse(ActionType.PRACTISE_BY_SET_AMOUNT);
    const getEvaluate$ = defaultResponse(ActionType.EVALUATE);

    return {
        getPractise$,
        getPractiseByAmount$,
        getPractiseBySet$,
        getPractiseBySetAmount$,
        getEvaluate$
    };

}

export function PractiseRepository(sources: Sources, action$: Stream<Action>): PractiseRepositorySinks {
    return {
        HTTP: requests(action$.remember()),
        response: responses(sources)
    };
}
