import { div, makeDOMDriver } from "@cycle/dom";
import { makeHTTPDriver } from "@cycle/http";
import { Stream } from "xstream";
import { run } from "@cycle/run";
import onionify, { StateSource } from "cycle-onionify";
import { Reducer, Sinks, Sources, State } from "./interfaces";
import { VNode } from "snabbdom/vnode";
import { MainComponent } from "./component/MainComponent";
import { wrappedModalify, modalify } from "cyclejs-modal";
import { ModalWrapper } from "./component/layout/ModalWrapper";

export type AppSources = Sources & { onion: StateSource<AppState> };
export type AppSinks = Sinks & { onion: Stream<Reducer>, modal: Stream<any> };
export interface AppState extends State {
}

const wrapper = ModalWrapper;
const app = App;

run(onionify(wrappedModalify(app, wrapper)), {
    DOM: makeDOMDriver('#app'),
    HTTP: makeHTTPDriver()
});

function App(sources: AppSources): AppSinks {

    const mainSinks = MainComponent(sources);

    return {
        DOM: view(mainSinks.DOM),
        HTTP: mainSinks.HTTP,
        onion: mainSinks.onion,
        modal: mainSinks.modal
    };

}

function view(vdom$: Stream<VNode>): Stream<VNode> {
    return vdom$.map(content =>
        div('#app', [
            div('.pusher', [
                div('.full.height', content)
            ])
        ])
    )
}