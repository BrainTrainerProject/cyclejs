import { BTN_SUBMIT, ID_DELETE_BTN, INP_DESC, INP_TAGS, INP_TITLE, INP_VISBILITY } from './set-form.view';
import { DOMSource } from '@cycle/dom';
import xs, { Stream } from "xstream";
import { ActionType, SetFormAction } from "./set-form.actions";
import { SetFormSources } from "./set-form";
import { isNullOrUndefined } from "util";

function combineActions(sources: SetFormSources, action$?: Stream<SetFormAction>): Stream<SetFormAction> {

    const propsAction$ = xs.of(sources)
        .filter(src => !!(src as any).props.action)
        .map(src => (src as any).props.action);

    const directAction$ = xs.of(action$)
        .filter(action => !isNullOrUndefined(action))
        .flatten();

    return xs.merge(propsAction$, directAction$).debug('SetFormModalAction') as Stream<SetFormAction>;
}

export function intent(sources, action$: Stream<SetFormAction>, imageProxy$: Stream<any>): IntentSinks {

    const DOM: DOMSource = sources.DOM;

    // UI
    const inputEvents = (selector) => DOM.select(selector).events('input').map(ev => (ev.target as HTMLInputElement).value);
    const clickEvents = (selector) => DOM.select(selector).events('click').map(ev => {
        ev.preventDefault();
        return ev;
    });

    // Actions
    function actionFilter(type: ActionType): Stream<SetFormAction> {
        return combineActions(sources, action$)
            .filter(action => !!action.type)
            .filter(action => action.type === type);
    }

    const createSetAction$ = actionFilter(ActionType.CREATE);
    const editSetAction$ = actionFilter(ActionType.EDIT);

    return {
        delete$: clickEvents(ID_DELETE_BTN),
        submit$: clickEvents(BTN_SUBMIT),
        inputTitle$: inputEvents(INP_TITLE),
        inputDescription$: inputEvents(INP_DESC),
        inputTags$: inputEvents(INP_TAGS),
        selectVisibility$: DOM.select(INP_VISBILITY).events('change'),

        createSetAction$: createSetAction$,
        editSetAction$: editSetAction$,
        imageChange$: imageProxy$,
    };

}

export interface IntentSinks {
    delete$: Stream<any>;
    submit$: Stream<any>;
    inputTitle$: Stream<any>;
    inputDescription$: Stream<any>;
    inputTags$: Stream<any>;
    selectVisibility$: Stream<any>;

    createSetAction$: Stream<any>;
    editSetAction$: Stream<any>;
    imageChange$: Stream<any>;
}