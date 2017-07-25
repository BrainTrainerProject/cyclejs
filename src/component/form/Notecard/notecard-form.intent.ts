import { Stream } from "xstream";
import { ActionType, NotecardFormAction } from "./notecard-form.actions";
import { ID_ANSWER, ID_DELETE_BTN, ID_SUBMIT, ID_TASK, ID_TITLE } from "./notecard-form.view";
import { NotecardFormSources } from "./notecard-form";
import dropRepeats from "xstream/extra/dropRepeats";

export interface IntentSinks {
    inputTitle$: Stream<any>
    inputTask$: Stream<any>
    inputAnswer$: Stream<any>
    submit$: Stream<any>
    delete$: Stream<any>

    createNotecardAction$: Stream<NotecardFormAction>
    editNotecardAction$: Stream<NotecardFormAction>
    showNotecardAction$: Stream<NotecardFormAction>
}

export function intent(sources: NotecardFormSources, action$: Stream<NotecardFormAction>): IntentSinks {

    const {DOM} = sources;

    // UI intents
    const delete$ = DOM.select(ID_DELETE_BTN).events('click');
    const inputTitle$ = DOM.select(ID_TITLE).events('input').map(e => (e.target as any).value);
    const inputTask$ = DOM.select(ID_TASK).events('input').map(e => (e.target as any).value);
    const inputAnswer$ = DOM.select(ID_ANSWER).events('input').map(e => (e.target as any).value);
    const submit$ = DOM.select(ID_SUBMIT).events('click');

    // Actions
    function actionFilter(type: ActionType): Stream<NotecardFormAction> {
        return action$
            .filter(action => !!action.type)
            .filter(action => action.type === type);
    }

    const createNotecardAction$ = actionFilter(ActionType.CREATE);
    const editNotecardAction$ = actionFilter(ActionType.EDIT);
    const showNotecardAction$ = actionFilter(ActionType.SHOW);

    return {
        inputTitle$,
        inputTask$,
        inputAnswer$,
        submit$,
        delete$,

        createNotecardAction$,
        editNotecardAction$,
        showNotecardAction$
    };

}

