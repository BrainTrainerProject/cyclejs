import {DOMSource, i, table, tbody, td, th, thead, tr} from "@cycle/dom";
import xs, {Stream} from "xstream";
import {VNode} from "snabbdom/vnode";

export type Sources = {
    DOM: DOMSource,
};
export type Sinks = {
    DOM: Stream<VNode>,
};

function intent(dom) {
    return {
        click$: dom.select('.center-content').events('click'),
        clickPopup$: dom.select('.electron-popup').events('click')
    };
}

function model(intent) {
    return xs.of("");
}

function view(model) {
    return model.click$.map(j => {

        return
    })
}

function NotecardList(sources: Sources): Sinks {

    /*const intents = intent(sources.DOM);
     const models = model(intents);
     const view$ = view(models);*/

    return {DOM: xs.of(getNotecardList())}
}

function getNotecardList() {

    return table(".ui.celled.striped.table", [
        thead([
            tr([
                th({
                    "attrs": {
                        "colspan": "2"
                    }
                }, [`Notecards`])
            ])
        ]),
        tbody([
            tr([
                td([`Initial commit`]),
                td(".right.aligned.collapsing", [`10 hours ago`])
            ]),
            tr([
                td([`Initial commit`]),
                td(".right.aligned", [`10 hours ago`])
            ])
        ])
    ])

}

export default NotecardList;