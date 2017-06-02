import {button, div, DOMSource, h1, makeDOMDriver, span} from '@cycle/dom';
import {makeHTTPDriver} from '@cycle/http';
import xs, {Stream} from 'xstream';
import {run} from '@cycle/run';
import onionify, {Lens, StateSource} from 'cycle-onionify';
import {Reducer, Sinks, Sources, State} from './interfaces';
import {VNode} from 'snabbdom/vnode';
import NotecardForm, {NotecardFormSinks} from './compontent/form/NotecardForm/index';
import isolate from '@cycle/isolate';

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
    /* const kateikarten$ = Karteikarte(sources);
     const nodecardList$ = NotecardList(sources);

     const layout$ = xs
     .combine(kateikarten$.DOM, nodecardList$.DOM)
     .map(([kartenkarten, nodecardlist]) => {
     return div([nodecardlist, kartenkarten])
     });*/

    const identityLens: Lens<State, State> = {
        get: state => state,
        set: (state, childState) => childState
    };

    const notecardFormSinks: NotecardFormSinks = isolate(NotecardForm, {onion: 'counter'})(sources);
    const notecardVDom$: Stream<VNode> = notecardFormSinks.DOM;
    const notecardReducer$ = notecardFormSinks.onion;
    const notecardHTTP$ = notecardFormSinks.HTTP;

    /*const submitForm$ = state$
     .map(state => state.counter)
     .filter(s => {
     if (s.submit === true) {
     s.submit = false;
     return true;
     }
     return false;
     })
     .map(s => ({
     url: 'http://localhost:8080/api/notecard',
     method: 'POST',
     category: 'post-notecard',
     send: {
     "title": s.title,
     "task": s.description,
     "answer": s.tags,
     }
     }));*/

    //const request$ = submitForm$;
    /*const response$ = sources.HTTP
        .select('post-notecard')
        .flatten().debug();*/

    const parentReducer$ = intent(sources.DOM) as Stream<Reducer>;
    const reducer$ = xs.merge(parentReducer$, notecardReducer$);

    const vdom$ = xs.combine(notecardVDom$ as Stream<VNode>, view(state$) as Stream<VNode>)
        .map(([sidebar, counter]) => div([sidebar, counter]));

    return {
        DOM: vdom$,
        HTTP: notecardHTTP$,
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