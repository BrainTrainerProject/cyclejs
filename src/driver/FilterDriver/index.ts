import { adapt } from "@cycle/run/lib/adapt";
import { DevToolEnabledSource } from "@cycle/run";
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
            console.log("Search Action");
        },

        "order": function (lock) {
            console.log("Order Action");
        },
    };

    function auth0Driver(action$) {

        const noop = () => {
        };

        const actionDone$ = action$
            .map(action => {

                if(!action){
                    return false
                }

                const actionFn = actions[action.action];

                if (!actionFn) {
                    console.error(`[FilterDriver] not available method: ${action.action}`);
                    return false;
                }

                return {
                    action: action.action,
                    value: action.value
                }

            });

        const select = responseSelector(actionDone$);

        actionDone$.addListener({next: noop, error: noop, complete: noop})

        return {
            select: select
        };
    }

    return auth0Driver;

}


function responseSelector(action$) {

    console.log('Select Filter')

    function selectEvent(event, action$) {

        var driversEvents = ["search", "order"];

        console.log('Selected Event: ' + event);

        if (driversEvents.indexOf(event) > -1) {
            return action$
                .filter(action => action.action === event)
                .map(action => action.value)
        }
        return xs
            .create({
                start: (listener) => {
                    console.log('start')
                    listener.next({action: 'search', value: 'xxx'})
                },
                stop: () => {
                }
            })
    }

    return function selectResponse(selector) {
        const events = selector
            .split(",")
            .map(sel => sel.replace(/ */, ""))
            .filter(sel => !!sel);

        const events$ = events.map(event => {
            console.log('event: ' + event);
            return selectEvent(event, action$)
        })

        return xs.merge(...events$);
    }
}