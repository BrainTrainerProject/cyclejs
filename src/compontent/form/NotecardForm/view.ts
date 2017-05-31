import { Stream } from "xstream";
import {
    BTN_SUBMIT,
    INP_DESC,
    INP_TAGS,
    INP_TITLE,
    INP_VISBILITY,
    NotecardFormState,
    NotecardVisibiblityType
} from "./index";
import { button, div, form, img, input, label, option, select, textarea } from "@cycle/dom";
import { VNode } from "snabbdom/vnode";

export function view(state$: Stream<NotecardFormState>): Stream<VNode> {
    return state$
        .map(state => {
            return getCreateForm(state)
        });
}

function getCreateForm(state: NotecardFormState): VNode {

    return div(".ui.grid", [
        div(".four.wide.column", [
            img(".ui.medium.image", {
                "attrs": {
                    "src": "http://i3.kym-cdn.com/photos/images/newsfeed/001/217/729/f9a.jpg",
                    "className": "ui medium image"
                }
            })
        ]),
        div(".twelve.wide.column", [
            form(".ui.form", [
                div(".field", [
                    label([`Titel`]),
                    div(INP_TITLE + ".field", [
                        input({
                            "attrs": {
                                "type": "text",
                                "placeholder": "Titel",
                                "value": state.title
                            }
                        })
                    ])
                ]),
                div(".field", [
                    label([`Beschreibung`]),
                    div(INP_DESC + ".field", [
                        textarea({
                            "attrs": {
                                "placeholder": "Beschreibung",
                                "value": state.description
                            }
                        })
                    ])
                ]),
                div(".field", [
                    label([`Tags`]),
                    div(INP_TAGS + ".field", [
                        input({
                            "attrs": {
                                "type": "text",
                                "placeholder": "Tags",
                                "value": state.tags
                            }
                        })
                    ])
                ]),
                div(".fields", [
                    div(".eight.wide.field"),
                    div(".four.wide.field.right.floated", [
                        select(INP_VISBILITY + ".ui.right.floated.dropdown", [
                            option({
                                    "attrs": {
                                        "value": "private",
                                        "selected": (state.visbility === NotecardVisibiblityType.PRIVATE) ? "selected" : ""
                                    }
                                },
                                [`Privat`]
                            ),
                            option({
                                "attrs": {
                                    "value": "public",
                                    "selected": (state.visbility === NotecardVisibiblityType.PUBLIC) ? "selected" : ""
                                }
                            }, [`Öffentlich`])
                        ])
                    ]),
                    div(".four.wide.field.", [
                        button(BTN_SUBMIT + ".ui.button.right.fluid.floated.", {
                            "attrs": {
                                "type": "submit",
                                "className": "ui button right fluid floated "
                            }
                        }, [`Submit`])
                    ])
                ])
            ])
        ])
    ])
}