import 'babel-polyfill';
import { div, makeDOMDriver } from '@cycle/dom';
import { makeHTTPDriver } from '@cycle/http';
import xs, { Stream } from 'xstream';
import { run } from '@cycle/run';
import onionify, { StateSource } from 'cycle-onionify';
import { Reducer, Sinks, Sources, State } from './common/interfaces';
import { VNode } from 'snabbdom/vnode';
import { wrappedModalify } from 'cyclejs-modal';
import { ModalWrapper } from './component/layout/ModalWrapper';
import { makeAuth0Driver, protect } from 'cyclejs-auth0';
import { createBrowserHistory } from 'history';
import switchPath from 'switch-path';
import { makeRouterDriver } from 'cyclic-router';
import { Router } from './component/Router';
import { makeFilterDriver } from './driver/FilterDriver/index';
import { makeSocketIODriver } from "./driver/SocketDriver/index";
import { PractiseModal } from "./common/Modals";

const config = require('./config.json');

export type AppSources = Sources & { onion: StateSource<AppState>, filter: any };
export type AppSinks = Sinks & { onion: Stream<Reducer>, modal: Stream<any>, filter: Stream<any> };

export interface AppState extends State {
}

run(onionify(wrappedModalify(App, ModalWrapper)), {
    DOM: makeDOMDriver('#app'),
    HTTP: makeHTTPDriver(),
    router: makeRouterDriver(createBrowserHistory(), switchPath),
    auth0: makeAuth0Driver(config.auth0.clientId, config.auth0.domain, {
        auth: {
            params: {scope: 'openid nickname'},
            responseType: 'token',
            redirect: true,
            redirectUrl: config.auth0.callbackUrl
        }
    }),
    filter: makeFilterDriver(),
    socket: makeSocketIODriver()
});

function App(sources: AppSources): AppSinks {
    const routerSinks = Router(sources);

    const filterListener$ = sources.filter.select('search').map(search => console.log('Suche: ' + search));



    return {
        ...routerSinks,
        HTTP: routerSinks.HTTP.debug('HTTP REQUEST'),
        DOM: view(routerSinks.DOM),
        auth0: routerSinks.auth0.debug('AUTH APP'),
        filter: xs.merge(routerSinks.filter.debug('Filter'), filterListener$)
    };
}

function view(vdom$: Stream<VNode>): Stream<VNode> {
    return vdom$.map(content =>
        div('#app', [
            div('.pusher', [
                div('.full.height', content)
            ])
        ])
    );
}