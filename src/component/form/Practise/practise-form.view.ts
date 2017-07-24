import { button, div, form, i, input, label, span, strong } from "@cycle/dom";
import { Stream } from "xstream";
import { VNode } from "snabbdom/vnode";
import { Mode, NotecardFormState } from "../Notecard//notecard-form";
import { PractiseFormState } from "./practise-form";
import { errorMessage } from "../../../common/GuiUtils";

export const ID_ANSWER = '.practise-answer';
export const ID_SUBMIT = '.practise-submit';
export const ID_DONT_KNOW = '.practise-dont-know';

export function view(state$: Stream<PractiseFormState>): Stream<VNode> {
    return state$
        .map(state => {
            console.log('JOJOJ')
            const item = state.practices[state.practiceIndex];
            const sumAnswers = state.practices.length;

            if (sumAnswers === 0) {
                return div(".ui.active.centered.inline.loader")
            }

            return div('.ui.grid', [
                div('.sixteen.wide.column', [
                    form('.ui.form', [
                        div('.field', [
                            label([item.title]),
                        ]),
                        div('.field', [
                            item.task
                            /*textarea(ID_TASK, {
                                hook: {
                                    insert: ({elm}) => {
                                        //$(elm).froalaEditor();
                                    }
                                }
                            }, [state.task])*/

                        ]),
                        div('.field', [
                            label([`Antwort`]),
                            div('.field', showResult(state))
                        ]),
                        div('.fields', [

                            div('.eight.wide.field', [
                                span({
                                    attrs: {
                                        style: 'display:block; color:#999; padding-top:10px;'
                                    }
                                }, [(state.practiceIndex + 1) + ' von ' + sumAnswers])
                            ]),

                            div('.four.wide.field.right.floated', [
                                (!state.finish && !state.showResult) ? button(ID_DONT_KNOW + ".ui.button.right.fluid.floated.", {
                                    attrs: {
                                        type: 'submit',
                                        style: 'background:none !important;'
                                    },
                                }, [`weiß nicht`]) : null
                            ]),

                            div('.four.wide.field.', [
                                button(ID_SUBMIT + '.ui.button.right.fluid.floated.', {
                                    'attrs': {
                                        'type': 'submit'
                                    }
                                }, [
                                    (state.isLast) ? 'abschließen' : (state.showResult) ? 'fortsetzen' : 'antworten'
                                ])
                            ])

                        ])

                    ]),
                    errorMessage(state as any)
                ])
            ])
        });
}


function showResult(state) {

    const showResult = state.showResult;
    const item = state.practices[state.practiceIndex];
    const answer = state.answer;
    const success = answer === item.answer;

    function resultView() {
        return [

            div({attrs: {style: 'text-align:center; padding-bottom: 10px;'}}, [
                (success) ? i(".checkmark.icon", {attrs: {style: 'color:#1EBC30; font-size:120px;'}}) :
                    (answer) ? i(".remove.icon", {attrs: {style: 'color:#DB2828; font-size:120px;'}}) : null,
            ]),

            (success) ? div(".ui.green.message", [
                    strong(['Richtig: ']),
                    span([answer])
                ]) :
                (answer) ? div(".ui.red.message", [
                    strong(['Falsch: ']),
                    span([answer])
                ]) : null,

            div(".ui.message", [
                strong(['Lösung: ']),
                span([item.answer])
            ]),
        ]
    }

    return (showResult) ? resultView() : [
        input(ID_ANSWER, {
            'attrs': {
                'type': 'text',
                'placeholder': 'Antwort',
                'value': state.answer
            }
        })]


}