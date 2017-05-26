import {div, DOMSource, makeDOMDriver} from "@cycle/dom";
import {makeHTTPDriver} from "@cycle/http";
import xs, {Stream} from "xstream";
import {VNode} from "snabbdom/vnode";
import {run} from "@cycle/run";
import Karteikarte from "./compontent/form/Karteikarte";
import NotecardList from "./compontent/NotecardList";

export type Sources = {
    DOM: DOMSource,
    HTTP: any
};

export type Sinks = {
    DOM: Stream<VNode>
};

function Main(sources: Sources): Sinks {

    const kateikarten$ = Karteikarte(sources);
    const nodecardList$ = NotecardList(sources);

    const layout$ = xs
        .combine(kateikarten$.DOM, nodecardList$.DOM)
        .map(([kartenkarten, nodecardlist]) => {
            return div([nodecardlist, kartenkarten])
        });

    return {
        DOM: layout$
    };
}

run(Main, {
    DOM: makeDOMDriver("#app"),
    HTTP: makeHTTPDriver()
});