import { div, makeDOMDriver } from "@cycle/dom";
import { makeHTTPDriver } from "@cycle/http";
import { Stream } from "xstream";
import { run } from "@cycle/run";
import onionify, { StateSource } from "cycle-onionify";
import { Reducer, Sinks, Sources, State } from "./common/interfaces";
import { VNode } from "snabbdom/vnode";
import { wrappedModalify } from "cyclejs-modal";
import { ModalWrapper } from "./component/layout/ModalWrapper";
import { makeAuth0Driver, protect } from "cyclejs-auth0";
import { createBrowserHistory } from "history";
import { captureClicks, makeHistoryDriver } from "@cycle/history";
import switchPath from "switch-path";
import { makeRouterDriver, RouterSource } from "cyclic-router";
import { Router } from "./component/Router";

const config = require('./config.json');

export type AppSources = Sources & { onion: StateSource<AppState> };
export type AppSinks = Sinks & { onion: Stream<Reducer>, modal: Stream<any> };
export interface AppState extends State {
}

run(onionify(wrappedModalify(App, ModalWrapper)), {
    DOM: makeDOMDriver('#app'),
    HTTP: makeHTTPDriver(),
    router: makeRouterDriver(createBrowserHistory(), switchPath),
    auth0: makeAuth0Driver(config.auth0.clientId, config.auth0.domain, {
        auth: {
            params: {scope: "openid nickname"},
            responseType: "token"
        }
    })
});

function App(sources: AppSources): AppSinks {
    const routerSinks = Router(sources);
    return {
        ...routerSinks,
        DOM: view(routerSinks.DOM)
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