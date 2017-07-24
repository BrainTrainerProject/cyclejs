import xs, { Stream } from "xstream";
import { Reducer } from "../../../common/interfaces";
import { inputErrorState, inputStream } from "../../../common/GuiUtils";
import { ModalAction } from "cyclejs-modal";
import { NotecardFormState } from "../Notecard//notecard-form";
import { ID_ANSWER, ID_TASK, ID_TITLE } from "../Notecard//notecard-form.view";
import sampleCombine from "xstream/extra/sampleCombine";
import { ActionType } from "../Notecard//notecard-form.actions";
import { IntentSinks } from "./practise-form.intent";
import {
    PractiseRepository,
    PractiseRepositoryActions,
    PractiseRepositorySinks
} from "../../../common/repository/PractiseRepository";
import { Mode, PractiseFormState } from "./practise-form";


function practiseRepositoryActions$(submitProxy$, actions: IntentSinks, state$): Stream<any> {


    return xs.merge(
        actions.practiseAction$.map(action => PractiseRepositoryActions.Practise()).debug('practiseAction$'),
        actions.practiseAmountAction$.map(({amount}) => PractiseRepositoryActions.PractiseByAmount(amount)).debug('practiseAmountAction$'),
        actions.practiseBySetAction$.map(({setId}) => PractiseRepositoryActions.PractiseBySet(setId)).debug('practiseBySetAction$'),
        actions.practiseBySetAmountAction$.map(({setId, amount}) => PractiseRepositoryActions.PractiseBySetAmount(setId, amount)).debug('practiseBySetAmountAction$'),
        submitProxy$
            .filter(state => state.mode === Mode.RESULT || state.mode === Mode.SKIP)
            .map(state => {
                const notecard = state.practices[state.practiceIndex];
                const success = state.answer === notecard.answer;
                return PractiseRepositoryActions.Evaluate([{notecard: notecard._id, success: success}]);
            }))

}

export function model(sources, actions: IntentSinks, state$: any): any {

    const submitProxy$ = xs.create();
    const practiseRepository: PractiseRepositorySinks = PractiseRepository(sources,
        practiseRepositoryActions$(submitProxy$, actions, state$)
    );

    const init$ = xs.of((): PractiseFormState => ({
        mode: Mode.PRACTICE,
        practiceIndex: 0,
        practices: [],
        result: [],
        showResult: false,
        answer: '',
        finish: false,
        isLast: false
    }));

    const notecardReponseReducer$: Stream<Reducer> = practiseRepository.response.getGlobalReponse$
        .map(notecard => (state) => {
            console.log("notecardReponseReducer$", notecard);
            return {
                ...state,
                practiceIndex: 0,
                practices: notecard,
                result: [],
                showResult: false,
                answer: '',
                finish: false,
                isLast: false
            }
        });

    const submitReducer$: Stream<Reducer> = actions.submit$
        .map(s => (state) => manageSubmit(state));

    const cancelReducer$: Stream<Reducer> = actions.submitCancel$
        .map(s => (state) => ({
            ...state,
            mode: Mode.SKIP,
            showResult: true,
            answer: '',
            errors: [],
            isLast: state.practiceIndex + 1 === state.practices.length
        }));

    const answerReducer$: Stream<Reducer> = inputStream(ID_ANSWER, 'answer', actions.inputAnswer$);

    const reducer$ = xs.merge(
        init$,
        submitReducer$,
        cancelReducer$,
        answerReducer$,
        notecardReponseReducer$
    );

    const submitRequest$ = xs.merge(actions.submit$, actions.submitCancel$)
        .compose(sampleCombine(state$))
        .map(([submitEvent, state]) => state as PractiseFormState);

    submitProxy$.imitate(submitRequest$);

    const finishSubmit$ = submitRequest$
        .filter(state => state.finish);

    // Modal
    const closeModal$ = xs.merge(finishSubmit$)
        .mapTo({type: 'close'} as ModalAction);

    return {
        onion: reducer$,
        HTTP: practiseRepository.HTTP,
        modal: closeModal$
    };
}

function manageSubmit(state): PractiseFormState {

    const isResultShowing = state.showResult;
    const sumPractises = state.practices.length;
    const isLast = sumPractises === state.practiceIndex + 1;

    if (state.isLast) {
        return {...state, finish: true}
    }

    if (isResultShowing) {
        return showPractise()
    } else {
        return showResult()
    }


    function incIndex() {
        if (state.practiceIndex + 1 >= sumPractises) {
            return state.practiceIndex
        } else {
            return state.practiceIndex + 1;
        }
    }

    function showPractise() {
        return {
            ...state,
            mode: Mode.PRACTICE,
            answer: '',
            practiceIndex: incIndex(),
            errors: [],
            showResult: false
        }
    }

    function showResult() {

        if (!state.showResult && !state.answer) {
            return inputErrorState(ID_ANSWER, 'Antwort eingeben!', state);
        } else {
            return {
                ...state,
                mode: Mode.RESULT,
                showResult: true,
                isLast: isLast
            }
        }
    }

}