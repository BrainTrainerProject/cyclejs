import { div, makeDOMDriver } from "@cycle/dom";
import { makeHTTPDriver } from "@cycle/http";
import xs, { Stream } from "xstream";
import { run } from "@cycle/run";
import onionify, { StateSource } from "cycle-onionify";
import { Reducer, Sinks, Sources, State } from "./interfaces";
import { VNode } from "snabbdom/vnode";
import { ModalComponent } from "./component/layout/ModalComponent";
import { makeModalDriver } from "./driver/ModalDriver/index";
import { MainComponent } from "./component/layout/MainComponent";

export type MainSources = Sources & { onion: StateSource<MainState> };
export type MainSinks = Sinks & { onion: Stream<Reducer> };
export interface MainState extends State {
}

run(onionify(Main), {
    DOM: makeDOMDriver('#app'),
    HTTP: makeHTTPDriver(),
    MODAL: makeModalDriver()
});

function Main(sources: MainSources): MainSinks {

    const mainSinks = MainComponent(sources);
    const modalSinks = ModalComponent(sources);

    const reducer$ = xs.merge(mainSinks.onion, modalSinks.onion);
    const vdom$ = view(xs.combine(mainSinks.DOM, modalSinks.DOM));
    const http$ = xs.merge(mainSinks.HTTP, modalSinks.HTTP);
    const modal$ = xs.merge(mainSinks.MODAL, modalSinks.MODAL);

    return {
        DOM: vdom$,
        HTTP: http$,
        onion: reducer$,
        MODAL: modal$
    };
}

function view(vdom$: Stream<VNode[]>): Stream<VNode> {
    return vdom$.map(([content, modal]) =>
        div('#app', [
            div('.pusher', [
                div('.full.height', [content])
            ]),
            div('.bottom', [modal])
        ])
    )
}