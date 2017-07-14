import xs from 'xstream';

export interface SearchAction {
    action: 'search';
    value: string;
}

export interface OrderAction {
    action: 'order';
    orderBy: OrderTypes;
    sortDirection: SortTypes;
}

export interface ResetAction {
    action: 'reset';
}

export enum SortTypes{
    DESC, ASC
}

export enum OrderTypes{
    DATE, RATING
}

export type FilterAction = ResetAction | SearchAction | OrderAction;

export function makeFilterDriver() {

    function filterDriver(action$) {

        const noop = () => {
        };

        const actionDone$ = action$
            .map(action => {

                if (!action) {
                    return false;
                }

                if (!isValidRequest(action)) {
                    console.error(`[FilterDriver] not available method: ${action}`);
                    return false;
                }

                return {...action};

            });

        const select = responseSelector(actionDone$);

        actionDone$.addListener({next: noop, error: noop, complete: noop});

        return {
            select: select
        };
    }

    return filterDriver;

}

function isValidRequest(request: FilterAction): boolean {
    if (typeof request === 'object') {
        switch (request.action) {
            case 'search':
            case 'order':
            case 'reset':
                return true;
            default:
                return false;
        }
    }
    return false;
}

function responseSelector(action$) {

    function selectEvent(event, action$) {

        if (isValidRequest({action: event})) {
            return action$
                .filter(action => action.action === event)
                .map(action => action);
        }

        return xs.empty();
    }

    return function selectResponse(selector) {
        const events = selector
            .split(',')
            .map(sel => sel.replace(/ */, ''))
            .filter(sel => !!sel);

        const events$ = events.map(event => {
            return selectEvent(event, action$);
        });

        return xs.merge(...events$);
    };

}