import { Stream } from "xstream";
import { ActionType, PractiseFormAction } from "./practise-form.actions";
import { PractiseFormSources } from "./practise-form";
import { ID_ANSWER, ID_DONT_KNOW, ID_SUBMIT } from "./practise-form.view";

export interface IntentSinks {
    submit$,
    inputAnswer$,
    submitCancel$,

    practiseAction$,
    practiseBySetAction$,
    practiseAmountAction$,
    practiseBySetAmountAction$,
}

export function intent(sources: PractiseFormSources, action$: Stream<PractiseFormAction>): IntentSinks {

    const {DOM} = sources;

    // UI intents
    const inputAnswer$ = DOM.select(ID_ANSWER).events('input').map(e => (e.target as any).value);
    const submit$ = DOM.select(ID_SUBMIT).events('click');
    const submitCancel$ = DOM.select(ID_DONT_KNOW).events('click');

    // Actions
    function actionFilter(type: ActionType): Stream<PractiseFormAction> {
        return action$
            .filter(action => !!action.type)
            .filter(action => action.type === type);
    }

    const practiseAction$ = actionFilter(ActionType.PRACTISE);
    const practiseBySetAction$ = actionFilter(ActionType.PRACTISE_BY_SET);
    const practiseAmountAction$ = actionFilter(ActionType.PRACTISE_AMOUNT);
    const practiseBySetAmountAction$ = actionFilter(ActionType.PRACTISE_BY_SET_AMOUNT);

    return {
        submit$,
        inputAnswer$,
        submitCancel$,

        practiseAction$,
        practiseBySetAction$,
        practiseAmountAction$,
        practiseBySetAmountAction$,
    };

}

