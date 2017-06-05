import { button, div, DOMSource, h1, makeDOMDriver, span } from "@cycle/dom";
import { makeHTTPDriver } from "@cycle/http";
import xs, { Stream } from "xstream";
import { run } from "@cycle/run";
import onionify, { StateSource } from "cycle-onionify";
import { Reducer, Sinks, Sources, State } from "./interfaces";
import { VNode } from "snabbdom/vnode";
import { Sidebar } from "./component/layout/Sidebar";
import { Content } from "./component/layout/Content";
import { ModalAction } from "cyclejs-modal";
import NotecardForm, { NotecardFormSinks } from "./component/form/NotecardForm/index";
import { ModalComponent } from "./component/layout/ModalComponent";
import { makeModalDriver } from "./driver/ModalDriver/index";

export type MainSources = Sources & { onion: StateSource<MainState>, modal: Stream<any> };
export type MainSinks = Sinks & { onion: Stream<Reducer> };
export interface MainState extends State {
    count: number;
}

run(onionify(Main), {
    DOM: makeDOMDriver('#app'),
    HTTP: makeHTTPDriver(),
    MODAL: makeModalDriver()
});

function Main(sources: MainSources): MainSinks {

    const state$ = sources.onion.state$;

    const sidebarSinks = Sidebar(sources);
    const contentSinks = Content(sources);
    const modalSinks = ModalComponent(sources);

    const parentReducer$ = intent(sources.DOM) as Stream<Reducer>;
    const reducer$ = xs.merge(parentReducer$, contentSinks.onion, modalSinks.onion);

    const vdom$ = xs.combine(
        sidebarSinks.DOM as Stream<VNode>,
        contentSinks.DOM as Stream<VNode>,
        modalSinks.DOM as Stream<VNode>,
        view(state$) as Stream<VNode>);

    const http$ = xs.merge(contentSinks.HTTP, modalSinks.HTTP);

    return {
        DOM: htmlWrapper(vdom$),
        HTTP: http$,
        onion: reducer$,
        MODAL: xs.merge(xs.of({type: 'open', component: NotecardForm}), modalSinks.MODAL)
    };
}

function modal(sources): Sinks {

    const notecardFormSinks: NotecardFormSinks = NotecardForm(sources);
    const notecardVDom$: Stream<VNode> = notecardFormSinks.DOM;
    const notecardReducer$ = notecardFormSinks.onion;
    const notecardHTTP$ = notecardFormSinks.HTTP;

    const vdom$ = viewz(notecardVDom$)
    const reducer$ = notecardReducer$
    const http$ = notecardHTTP$

    return {
        DOM: vdom$,
        HTTP: http$,
        onion: reducer$,
        modal: sources.DOM.select('.button').events('click')
            .mapTo({type: 'close'} as ModalAction)
    };
}

function viewz(vdom$: Stream<VNode>) {
    return vdom$.map(notecard => div("#mainz-container", [
        div("#content-left.left-main", [notecard])
    ]))
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