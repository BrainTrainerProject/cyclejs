import xs, { Stream } from "xstream";
import { StateSource } from "cycle-onionify";
import { Reducer, Sinks, Sources, State } from "../../../common/interfaces";
import { button, div, form, i, input, label, textarea } from "@cycle/dom";
import { VNode } from "snabbdom/vnode";
import { errorMessage, ErrorMessageState, inputErrorState, inputStream } from "../../../common/GuiUtils";
import sampleCombine from "xstream/extra/sampleCombine";
import { Utils } from "../../../common/Utils";
import { PostNotecardApi, PostNotecardProps } from "../../../common/api/notecard/PostNotecard";
import { UpdateNotecardApi, UpdateNotecardProps } from "../../../common/api/notecard/UpdateNotecard";
import { ModalAction } from "cyclejs-modal";

const ID_DELETE_BTN = '.notecard-delete';
const ID_TITLE = '.notecard-title';
const ID_TASK = '.notecard-task';
const ID_ANSWER = '.notecard-answer';
const ID_SUBMIT = '.notecard-submit';

export type NotecardFormSources = Sources & { onion: StateSource<NotecardFormState> };
export type NotecardFromSinks = Sinks & { onion: Stream<Reducer> };
export interface NotecardFormState extends State {
    action: NotecardFormAction;
    id: string,
    title: string;
    task: string;
    answer: string;
    errors: ErrorMessageState;
}

export interface CreateNotecardFormAction {
    type: 'create';
    setId: string;
}

export interface EditNotecardFormAction {
    type: 'edit';
    notecardId: string;
}

export interface DeleteNotecardFormAction {
    type: 'delete';
}

export type NotecardFormAction = EditNotecardFormAction | CreateNotecardFormAction | DeleteNotecardFormAction;

export default function NotecardForm(sources: NotecardFormSources): NotecardFromSinks {

    const state$ = sources.onion.state$;
    const actions = intent(sources);
    const reducer = model(actions, state$, loadAction(sources));

    const sinks = {
        DOM: view(state$),
        onion: reducer.onion,
        HTTP: reducer.HTTP,
        modal: reducer.modal
    };
    return sinks;

}

function loadAction(sources): NotecardFormAction {
    if (sources.props && sources.props.action) {
        return {...sources.props.action}
    }
    return {type: 'create'} as CreateNotecardFormAction;
}

function intent(sources: NotecardFormSources): any {

    const {DOM} = sources;

    const delete$       = DOM.select(ID_DELETE_BTN).events('click');
    const inputTitle$   = DOM.select(ID_TITLE).events('input').map(e => e.target.value);
    const inputTask$    = DOM.select(ID_TASK).events('input').map(e => e.target.value);
    const inputAnswer$  = DOM.select(ID_ANSWER).events('input').map(e => e.target.value);
    const submit$       = DOM.select(ID_SUBMIT).events('click');

    return {
        inputTitle$,
        inputTask$,
        inputAnswer$,
        submit$,
        delete$
    };
}

function model(actions: any, state$: any, formAction: NotecardFormAction): any {

    // Reducer

    const init$: Stream<Reducer> = xs.of(function initReducer(): any {
        return {
            action: formAction,
            id: (formAction.type === 'edit') ? formAction.notecardId : '',
            title: '',
            task: '',
            answer: '',
            errors: {}
        };
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
        titleReducer$,
        taskReducer$,
        answerReducer$,
        submitValid$
    );

    // HTTP

    const submitRequest$ = submitValid$
        .compose(sampleCombine(state$))
        .map(([submitEvent, state]) => state)
        .filter(state => !Utils.jsonHasChilds(state.errors))
        .map(state => buildSubmitRequest(state));


    // Modal

    const closeModal$ = xs.merge(submitRequest$)
        .mapTo({type: 'close'} as ModalAction);

    return {
        onion: reducer$,
        HTTP: submitRequest$,
        modal: closeModal$
    };
}

function buildSubmitRequest(state) {

    switch (state.action.type) {

        case 'create':
            return PostNotecardApi.buildRequest({
                send: {
                    title: state.title,
                    task: state.task,
                    answer: state.answer
                },
                refSet: state.action.setId
            } as PostNotecardProps);

        case 'edit':
            return UpdateNotecardApi.buildRequest({
                id: state.id,
                send: {
                    title: state.title,
                    task: state.task,
                    answer: state.answer
                },
            } as UpdateNotecardProps);
    }

}


export function view(state$: Stream<NotecardFormState>): Stream<VNode> {
    return state$
        .map(state => div('.ui.grid', [
            div('.sixteen.wide.column', [
                form('.ui.form', [
                    div('.field', [
                        label([`Titel`]),
                        div('.field', [
                            input(ID_TITLE, {
                                'attrs': {
                                    'type': 'text',
                                    'placeholder': 'Titel'
                                }
                            })
                        ])
                    ]),
                    div('.field', [
                        label([`Aufgabe`]),
                        div('.field', [
                            textarea(ID_TASK, {
                                hook: {
                                    insert: ({elm}) => {
                                        //$(elm).froalaEditor();
                                    }
                                }
                            })
                        ])
                    ]),
                    div('.field', [
                        label([`Antwort`]),
                        div('.field', [
                            input(ID_ANSWER, {
                                'attrs': {
                                    'type': 'text',
                                    'placeholder': 'Antwort'
                                }
                            })
                        ])
                    ]),
                    div('.fields', [
                        div('.eight.wide.field', [
                            (state.action.type !== 'edit') ? null : button(ID_DELETE_BTN + '.ui.icon.red.basic.button.', {
                                'attrs': {
                                    'type': 'submit'
                                }
                            }, [
                                i('.icon.trash.outline')
                            ])
                        ]),
                        div('.four.wide.field.right.floated', []),
                        div('.four.wide.field.', [
                            button(ID_SUBMIT + '.ui.button.right.fluid.floated.', {
                                'attrs': {
                                    'type': 'submit'
                                }
                            }, [(state.action.type === 'edit') ? 'bearbeiten' : 'erstellen'])
                        ])
                    ])
                ]),
                errorMessage(state)
            ])
        ]));
}