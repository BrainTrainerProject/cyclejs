import xs, { Stream } from "xstream";
import { Reducer } from "../../../common/interfaces";
import { inputErrorState, inputStream } from "../../../common/GuiUtils";
import { Utils } from "../../../common/Utils";
import { ModalAction } from "cyclejs-modal";
import { Mode, NotecardFormState } from "./notecard-form";
import { ID_ANSWER, ID_TASK, ID_TITLE } from "./notecard-form.view";
import sampleCombine from "xstream/extra/sampleCombine";
import {
    NotecardRepository,
    NotecardRepositoryAction,
    NotecardRepositoryActions,
    NotecardRepositorySinks
} from "../../../common/repository/NotecardRepository";
import { IntentSinks } from "./notecard-form.intent";
import { ActionType } from "./notecard-form.actions";


function notecardRepositoryActions$(notecardRepositoryProxy$, actions, state$): Stream<any> {

    const loadEditNotecard$ = actions.editNotecardAction$
        .map(action => {
            console.log('Action', action);
            return NotecardRepositoryActions.GetById(action.notecardId)
        });

    const deleteNotecard$ = actions.delete$
        .compose(sampleCombine(state$))
        .map(([event, state]) => NotecardRepositoryActions.Delete(state.notecardId))

    return xs.merge(notecardRepositoryProxy$, loadEditNotecard$, deleteNotecard$) as Stream<any>

}

export function model(sources, actions: IntentSinks, state$: any): any {

    const notecardRepositoryProxy$: Stream<NotecardRepositoryAction> = xs.create();
    const notecardRepository: NotecardRepositorySinks = NotecardRepository(sources,
        notecardRepositoryActions$(notecardRepositoryProxy$, actions, state$)
    );

    // Reducer
    const init$: Stream<Reducer> = xs.of(function initReducer(): NotecardFormState {
        return {
            mode: Mode.CREATE,
            setId: '',
            notecardId: '',
            title: '',
            task: '',
            answer: '',
            errors: [] as any
        };
    });

    const initActions$: Stream<Reducer> = xs.merge(actions.createNotecardAction$, actions.editNotecardAction$)
        .map(action => action as any)
        .map(action => (state) => {
            console.log("InitAction$", action);
            return {
                ...state,
                mode: (action.type === ActionType.EDIT) ? Mode.EDIT : Mode.CREATE,
                setId: (!!action.setId) ? action.setId : '',
                notecardId: (!!action.notecardId) ? action.notecardId : ''
            };
        });


    const notecardReponseReducer$: Stream<Reducer> = notecardRepository.response.getNotecardByIdResponse$
        .map(notecard => (state) => {
            console.log("notecardReponseReducer$", notecard);
            return {
                ...state,
                title: notecard.title,
                task: notecard.task,
                answer: notecard.answer
            }
        });

    const titleReducer$: Stream<Reducer> = inputStream(ID_TITLE, 'title', actions.inputTitle$);
    const taskReducer$: Stream<Reducer> = inputStream(ID_TASK, 'task', actions.inputTask$);
    const answerReducer$: Stream<Reducer> = inputStream(ID_ANSWER, 'answer', actions.inputAnswer$);

    const submitValid$: Stream<Reducer> = actions.submit$
        .map(submit => (state) => {
            if (!state.title) {
                state = inputErrorState(ID_TITLE, 'Titel eingeben!', state);
            }

            if (!state.task) {
                state = inputErrorState(ID_TASK, 'Task eingeben!', state);
            }

            if (!state.answer) {
                state = inputErrorState(ID_ANSWER, 'Antwort eingeben!', state);
            }
            return state;
        });

    const reducer$ = xs.merge(
        init$,
        initActions$,
        titleReducer$,
        taskReducer$,
        answerReducer$,
        submitValid$,
        notecardReponseReducer$
    );

    // HTTP
    const submitRequest$ = submitValid$
        .compose(sampleCombine(state$))
        .map(([submitEvent, state]) => state as NotecardFormState)
        .filter(state => !Utils.jsonHasChilds(state.errors))
        .map(state => buildRepositoryAction(state));

    notecardRepositoryProxy$.imitate(submitRequest$);

    // Modal
    const closeModal$ = xs.merge(submitRequest$, actions.delete$)
        .mapTo({type: 'close'} as ModalAction);

    return {
        onion: reducer$,
        HTTP: notecardRepository.HTTP,
        modal: closeModal$
    };
}

function buildRepositoryAction(state: NotecardFormState) {

    const currNotecardEntity = {
        title: state.title,
        task: state.task,
        answer: state.answer
    };
    console.log('PASSED MODE CREATE', state);
    switch (state.mode) {

        case Mode.CREATE:
            if (!state.setId) return 'Noteform Model: create error!';
            console.log('PASSED MODE CREATE', state);
            return NotecardRepositoryActions.AddToSet(state.setId, currNotecardEntity);

        case Mode.EDIT:
            if (!state.notecardId) return 'Noteform Model: edit error!';
            console.log('PASSED MODE EDIT', state);
            return NotecardRepositoryActions.Edit(state.notecardId, currNotecardEntity);
    }

}