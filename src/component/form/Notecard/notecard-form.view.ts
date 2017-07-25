import { errorMessage } from "../../../common/GuiUtils";
import { button, div, form, i, input, label, span, textarea } from "@cycle/dom";
import { Stream } from "xstream";
import { VNode } from "snabbdom/vnode";
import { Mode, NotecardFormState } from "./notecard-form";

export const ID_DELETE_BTN = '.notecard-delete';
export const ID_TITLE = '.notecard-title';
export const ID_TASK = '.notecard-task';
export const ID_ANSWER = '.notecard-answer';
export const ID_SUBMIT = '.notecard-submit';

export function view(state$: Stream<NotecardFormState>): Stream<VNode> {
    return state$
        .map(state => {
            console.log("Viewssss", state)

            return div('.ui.grid', [
                div('.sixteen.wide.column', [
                    form('.ui.form', [
                        div('.field', [
                            label([`Titel`]),
                            div('.field', [
                                (state.mode === Mode.SHOW) ?
                                    span([state.title])
                                    : input(ID_TITLE, {
                                        'attrs': {
                                            'type': 'text',
                                            'placeholder': 'Titel',
                                            'value': state.title
                                        }
                                    })
                            ])
                        ]),
                        div('.field', [
                            label([`Aufgabe`]),
                            div('.field', [
                                (state.mode === Mode.SHOW) ?
                                    span([state.task]) : textarea(ID_TASK, {
                                        hook: {
                                            insert: ({elm}) => {
                                                //$(elm).froalaEditor();
                                            }
                                        }
                                    }, [state.task])
                            ])
                        ]),
                        div('.field', [
                            label([`Antwort`]),
                            div('.field', [
                                (state.mode === Mode.SHOW) ?
                                    span([state.answer]) : input(ID_ANSWER, {
                                        'attrs': {
                                            'type': 'text',
                                            'placeholder': 'Antwort',
                                            'value': state.answer
                                        }
                                    })
                            ])
                        ]),
                        div('.fields', [
                            div('.eight.wide.field', [
                                (state.mode !== Mode.EDIT) ? null : button(ID_DELETE_BTN + '.ui.icon.red.basic.button.', {
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
                                }, [(state.mode === Mode.EDIT) ? 'bearbeiten' : (state.mode === Mode.CREATE) ? 'erstellen' : 'schließen'])
                            ])
                        ])
                    ]),
                    errorMessage(state as any)
                ])
            ])
        });
}