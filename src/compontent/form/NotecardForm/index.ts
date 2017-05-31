import { button, div, DOMSource, form, img, input, label, option, select, textarea } from "@cycle/dom";
import xs, { Stream } from "xstream";
import { VNode } from "snabbdom/vnode";
import { StateSource } from "cycle-onionify";
import { Reducer, Sinks, Sources, State } from "../../../interfaces";

export type NotecardFormSources = Sources & { onion: StateSource<NotecardFormState> };
export type NotecardFormSinks = Sinks & { onion: Stream<Reducer> };
export interface NotecardFormState extends State {
    type: NotecardFormSubmitType,
    title: String,
    description: String,
    tags: String,
    visbility: NotecardVisibiblityType,
    submit: boolean
}

const BTN_SUBMIT = ".btn_submit";
const INP_TITLE = ".inp_title";
const INP_DESC = ".inp_desc";
const INP_TAGS = ".inp_tags";
const INP_VISBILITY = ".inp_tags";

enum NotecardFormSubmitType{
    ADD, EDIT, DELETE
}

enum NotecardVisibiblityType{
    PRIVATE, PUBLIC
}

function NotecardForm(sources: NotecardFormSources): NotecardFormSinks {

    const state$ = sources.onion.state$;
    const action$ = intent(sources.DOM);
    const reducer$ = model(action$);

    const vdom$ = view(state$);
    return {DOM: vdom$, onion: reducer$}
}

function intent(dom: DOMSource): any {
    return {
        submit$: dom.select(BTN_SUBMIT).events("click")
            .map(ev => {
                ev.preventDefault();
                return ev;
            }),
        inputTitle$: dom.select(INP_TITLE).events("input"),
        inputDescription$: dom.select(INP_DESC).events("input"),
        inputTags$: dom.select(INP_TAGS).events("input"),
        selectVisibility$: dom.select(INP_VISBILITY).events("change")
    };
}

function model(intent, prevState?: NotecardFormState): Stream<Reducer> {

    const default$: Stream<Reducer> = xs.of(function defaultReducer(): any {
        if (typeof prevState === 'undefined') {

            return Object.assign({}, {
                type: NotecardFormSubmitType.ADD,
                title: "test",
                description: "",
                tags: "",
                visbility: NotecardVisibiblityType.PRIVATE,
                submit: false
            })

        } else {
            return prevState;
        }
    });

    const titleChange$: Stream<Reducer> = intent.inputTitle$
        .map(ev => (ev.target as any).value)
        .map(title => function titleReducer(prevState: NotecardFormState): NotecardFormState {

            return Object.assign({}, prevState, {
                title: title
            })

        })


    const descChange$: Stream<Reducer> = intent.inputDescription$
        .map(ev => (ev.target as any).value)
        .map(title => function descriptionReducer(prevState: NotecardFormState): NotecardFormState {

            return Object.assign({}, prevState, {
                description: title
            })

        })

    const tagsChange$: Stream<Reducer> = intent.inputTags$
        .map(ev => (ev.target as any).value)
        .map(tags => function tagsReducer(prevState: NotecardFormState): NotecardFormState {

            return Object.assign({}, prevState, {
                tags: tags
            })

        })

    const visibilityChange$: Stream<Reducer> = intent.selectVisibility$
        .map(ev => {
            for (let child of ev.target.children) {
                if (child.selected) {
                    switch (child.value) {
                        case "private" :
                            return NotecardVisibiblityType.PRIVATE;
                        case "public" :
                            return NotecardVisibiblityType.PUBLIC;
                    }
                }
            }
            return NotecardVisibiblityType.PRIVATE;
        })
        .map(tags => function tagsReducer(prevState: NotecardFormState): NotecardFormState {

            return Object.assign({}, prevState, {
                visibility: tags
            })

        })

    return xs.merge(
        default$,
        titleChange$,
        descChange$,
        tagsChange$,
        visibilityChange$,
        intent.submit$.map(tags => function tagsReducer(prevState: NotecardFormState): NotecardFormState {

            return Object.assign({}, prevState, {
                submit: true
            })
        }) as Stream<Reducer>
    );

}

function view(state$: Stream<NotecardFormState>): Stream<VNode> {
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

export default NotecardForm;