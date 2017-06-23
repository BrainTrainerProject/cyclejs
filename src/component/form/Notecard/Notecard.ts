import xs, {Stream} from 'xstream';
import {StateSource} from 'cycle-onionify';
import {Reducer, Sinks, Sources, State} from '../../../common/interfaces';
import {button, div, form, input, label, textarea} from '@cycle/dom';
import {CRUDType} from '../../../common/CRUDType';
import {VNode} from 'snabbdom/vnode';
import {errorMessage, ErrorMessageState, inputErrorState, inputStream} from '../../../common/GuiUtils';
import sampleCombine from 'xstream/extra/sampleCombine';
import {Utils} from '../../../common/Utils';
import {PostNotecardApi, PostNotecardProps} from '../../../common/api/PostNotecard';

export type NotecardFormSources = Sources & { onion: StateSource<NotecardFormState> };
export type NotecardFromSinks = Sinks & { onion: Stream<Reducer> };
export interface NotecardFormState extends State {
    type: CRUDType.ADD;
    refSet: string;
    title: string;
    task: string;
    answer: string;
    errors: ErrorMessageState;
}

export interface NotecardFormProps {
    refSet: string;
}

const ID_TITLE = '.notecard-title';
const ID_TASK = '.notecard-task';
const ID_ANSWER = '.notecard-answer';
const ID_SUBMIT = '.notecard-submit';

export default function NotecardForm(sources: NotecardFormSources): NotecardFromSinks {

    const state$ = sources.onion.state$;
    const actions = intent(sources);
    const reducer = model(actions, state$, sources.props);

    const sinks = {
        DOM: view(state$),
        onion: reducer.onion,
        HTTP: reducer.HTTP
    };
    return sinks;

}

function intent(sources: NotecardFormSources): any {

    const {DOM} = sources;

    const inputTitle$ = DOM.select(ID_TITLE).events('input').map(e => e.target.value);
    const inputTask$ = DOM.select(ID_TASK).events('input').map(e => e.target.value);
    const inputAnswer$ = DOM.select(ID_ANSWER).events('input').map(e => e.target.value);
    const submit$ = DOM.select(ID_SUBMIT).events('click');

    return {
        inputTitle$,
        inputTask$,
        inputAnswer$,
        submit$
    };
}

function model(actions: any, state$: any, props?: any, prevState?: NotecardFormState): any {

    const init$: Stream<Reducer> = xs.of(function defaultReducer(): any {
        if (typeof prevState === 'undefined') {
            return {
                type: CRUDType.ADD,
                title: '',
                task: '',
                answer: '',
                errors: {}
            };
        }
        return prevState;
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
        .map(state => (PostNotecardApi.buildRequest({
            send: {
                title: state.title,
                task: state.task,
                answer: state.answer
            },
            refSet: props.refSet
        } as PostNotecardProps)))
        .debug('SubmitRequest');

    return {
        onion: reducer$,
        HTTP: submitRequest$
    };
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
                        div('.eight.wide.field'),
                        div('.four.wide.field.right.floated', []),
                        div('.four.wide.field.', [
                            button(ID_SUBMIT + '.ui.button.right.fluid.floated.', {
                                'attrs': {
                                    'type': 'submit'
                                }
                            }, [`speichern`])
                        ])
                    ])
                ]),
                errorMessage(state)
            ])
        ]));
}