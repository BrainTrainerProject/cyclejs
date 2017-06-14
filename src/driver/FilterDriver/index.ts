import { adapt } from "@cycle/run/lib/adapt";
import { DevToolEnabledSource } from "@cycle/run";
import { isNullOrUndefined } from "util";
import xs from "xstream";


export class FilterSource {

    constructor(private _res$$) {
    }

    public get() {
        return adapt(this._res$$) as DevToolEnabledSource;
    }

}

export interface SearchAction {
    action: 'search';
    value: string
}

export interface OrderAction {
    action: 'order';
    value: OrderActionTypes
}

export enum OrderActionTypes{
    DATE, RATING
}

export type FilterAction = SearchAction | OrderAction;

export function makeFilterDriver() {


    const actions = {
        "search": function (lock) {

        },

        "order": function (lock) {

        },

    };

    function auth0Driver(action$) {

        const noop = () => {};

        const actionDone$ = action$
            .map(action => {
                var actionFn = actions[action.action];
                if (!actionFn) {
                    console.error(`[FilterDriver] not available method: ${action.action}`);
                    return false;
                }
                var promise = actionFn(action.params);
                return {
                    action: action.action
                }
            })
            .remember();

        const select = responseSelector(actionDone$);

        actionDone$.addListener({next: noop, error: noop, complete: noop})

        return {
            select: select
        };
    }

    return auth0Driver;

}

function isValidRequest(request: any): boolean {
    if (typeof request === 'object') {
        switch (request.action) {
            case 'search':
            case 'order':
                return true;
            default:
                return false;
        }
    }
    return false;
}


function responseSelector(action$) {

    function selectEvent(event, action$) {
        var driversEvents = ["search", "order"];

        if (driversEvents.indexOf(event) > -1) {
            return action$
                .filter(action => action.action === event)
                .map(action => action.response$)
                .flatten()
                .map(response => ({event, response}))
        }
        return xs
            .create({
                start: (listener) => listener.next({event}),
                stop: () => {
                }
            })
    }

    return function selectResponse(selector) {
        const events = selector
            .split(",")
            .map(sel => sel.replace(/ */, ""))
            .filter(sel => !!sel);

        const events$ = events.map(event => selectEvent(event, action$))

        return xs.merge(...events$);
    }
}