import { button, div, DOMSource, h1, makeDOMDriver, span } from "@cycle/dom";
import { makeHTTPDriver } from "@cycle/http";
import xs, { Stream } from "xstream";
import { run } from "@cycle/run";
import onionify, { StateSource } from "cycle-onionify";
import { Reducer, Sinks, Sources, State } from "./interfaces";
import { VNode } from "snabbdom/vnode";
import NotecardForm, { NotecardFormSinks } from "./component/form/NotecardForm/index";
import isolate from "@cycle/isolate";
import { PostNotecardApi } from "./component/common/ApiRequests";
import { Sidebar } from "./component/layout/Sidebar";
import { Content } from "./component/layout/Content";
import { Modal } from "./component/layout/Modal";

export type MainSources = Sources & { onion: StateSource<MainState> };
export type MainSinks = Sinks & { onion: Stream<Reducer> };
export interface MainState extends State {
    count: number;
}

run(onionify(Main), {
    DOM: makeDOMDriver('#app'),
    HTTP: makeHTTPDriver()
});

function Main(sources: MainSources): MainSinks {

    const state$ = sources.onion.state$;

    const sidebarSinks  = Sidebar(sources);
    const contentSinks  = Content(sources);
    const modalSinks    = Modal(sources);

    const parentReducer$ = intent(sources.DOM) as Stream<Reducer>;
    const reducer$ = xs.merge(parentReducer$, contentSinks.onion);

    const vdom$ = xs.combine(
        sidebarSinks.DOM as Stream<VNode>,
        contentSinks.DOM as Stream<VNode>,
        modalSinks.DOM as Stream<VNode>,
        view(state$) as Stream<VNode>);

    const http$ = contentSinks.HTTP;

    return {
        DOM: htmlWrapper(vdom$),
        HTTP: http$,
        onion: reducer$
    };
}

function intent(DOM: DOMSource): Stream<Reducer> {
    const init$: Stream<Reducer> = xs.of<Reducer>(() => ({count: 5}));

    const add$: Stream<Reducer> = DOM.select('.add').events('click')
        .mapTo<Reducer>(state => ({...state, count: (state as MainState).count + 1}))
        .debug();

    const subtract$: Stream<Reducer> = DOM.select('.subtract').events('click')
        .mapTo<Reducer>(state => ({...state, count: (state as MainState).count - 1}))
        .debug();

    return xs.merge(init$, add$, subtract$);
}

function view(state$: Stream<MainState>): Stream<VNode> {
    return state$
        .map(s => s.count)
        .map(count =>
            div([
                h1(['Counter']),
                span(['Counter ' + count]),
                button('.add', ['inc']),
                button('.subtract', ['dec'])
            ])
        );
}

function htmlWrapper(vdom$: Stream<[VNode]>): Stream<VNode> {
    return vdom$.map(([sidebar, content, modal, counter]) =>
        div('#app', [
            div('.pusher', [
                div('.full.height', [sidebar, content])
            ]),
            div('.other', [modal, counter])
        ])
    )
}