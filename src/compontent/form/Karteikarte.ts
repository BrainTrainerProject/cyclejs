import {button, div, DOMSource, form, img, input, label, option, select, textarea} from "@cycle/dom";
import xs, {Stream} from "xstream";
import {VNode} from "snabbdom/vnode";

export type Sources = {
    DOM: DOMSource,
};
export type Sinks = {
    DOM: Stream<VNode>,
};

const BTN_SUBMIT = ".btn_submit";
const INP_TITLE = ".inp_title";
const INP_DESC = ".inp_desc";
const INP_TAGS = ".inp_tags";
const INP_VISBILITY = ".inp_tags";

enum NotecardSubmitType{
    ADD, EDIT, DELETE
}

enum NotecardVisibiblityType{
    PRIVATE, PUBLIC
}

interface NotecardSubmit {
    type: NotecardSubmitType,
    title: String,
    description: String,
    tags: String,
    visbility: NotecardVisibiblityType
}

// Default
let notecardValues: NotecardSubmit = {
    type: NotecardSubmitType.ADD,
    title: "",
    description: "",
    tags: "",
    visbility: NotecardVisibiblityType.PRIVATE
};

function intent(dom) {
    return {
        submit$: dom.select(BTN_SUBMIT).events("click")
            .map(ev => {
                ev.preventDefault();
                return ev;
            }).debug(e => console.log(notecardValues)),

        inputTitle$: dom.select(INP_TITLE).events("input"),
        inputDescription$: dom.select(INP_DESC).events("input"),
        inputTags$: dom.select(INP_TAGS).events("input")

    };
}

function model(intent) {

    const titleChange$ = intent.inputTitle$
        .map(ev => (ev.target as any).value)
        .startWith(notecardValues.title);

    const descChange$ = intent.inputDescription$
        .map(ev => (ev.target as any).value)
        .startWith(notecardValues.description);

    const tagsChange$ = intent.inputTags$
        .map(ev => (ev.target as any).value)
        .startWith(notecardValues.tags);

    const state$ = xs.combine(
        titleChange$,
        descChange$,
        tagsChange$,
        intent.submit$.startWith())
        .map(([title, desc, tags, submit]) => {
            return xs.of({
                type: notecardValues.type,
                title: title,
                description: desc,
                tags: tags,
                visbility: notecardValues.visbility
            } as NotecardSubmit);
        })

    return state$;
}

function view(model$) {
    return model$.map(x => getCreateForm());
}

function Karteikarte(sources: Sources): Sinks {

    const intents = intent(sources.DOM);
    const state$ = model(intents);
    const view$ = view(state$);

    return {DOM: view$}
}

function getCreateForm(): VNode {


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
                                "placeholder": "Titel"
                            }
                        })
                    ])
                ]),
                div(".field", [
                    label([`Beschreibung`]),
                    div(INP_DESC + ".field", [
                        textarea({
                            "attrs": {
                                "placeholder": "Beschreibung"
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
                                "placeholder": "Tags"
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
                                    "value": "private"
                                }
                            }, [`Privat`]),
                            option({
                                "attrs": {
                                    "value": "public"
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
        ;
}

export default Karteikarte;