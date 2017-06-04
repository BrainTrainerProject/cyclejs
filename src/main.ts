import { button, div, DOMSource, h1, makeDOMDriver, span } from "@cycle/dom";
import { makeHTTPDriver } from "@cycle/http";
import xs, { Stream } from "xstream";
import { run } from "@cycle/run";
import onionify, { StateSource } from "cycle-onionify";
import { Reducer, Sinks, Sources, State } from "./interfaces";
import { VNode } from "snabbdom/vnode";
import NotecardForm, { NotecardFormSinks } from "./compontent/form/NotecardForm/index";
import isolate from "@cycle/isolate";
import { PostNotecardApi } from "./compontent/common/ApiRequests";

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

    const notecardFormSinks: NotecardFormSinks = isolate(NotecardForm, {onion: 'counter'})(sources);
    const notecardVDom$: Stream<VNode> = notecardFormSinks.DOM;
    const notecardReducer$ = notecardFormSinks.onion;
    const notecardHTTP$ = notecardFormSinks.HTTP;

    const parentReducer$ = intent(sources.DOM) as Stream<Reducer>;
    const reducer$ = xs.merge(parentReducer$, notecardReducer$);

    const vdom$ = xs.combine(notecardVDom$ as Stream<VNode>, view(state$) as Stream<VNode>)
        .map(([sidebar, counter]) => div([sidebar, counter]));

    const response$ = sources.HTTP
        .select(PostNotecardApi.ID)
        .flatten()
        .debug('response inside main');

    return {
        DOM: vdom$,
        HTTP: xs.merge(notecardHTTP$, response$),
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