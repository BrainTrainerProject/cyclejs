import xs, { Stream } from "xstream";
import { Sources, State } from "../../../common/interfaces";
import { Collection, StateSource } from "cycle-onionify";
import { button, div, DOMSource, input, span } from "@cycle/dom";
import List, { Sources as ListSources, State as ListState } from "../../lists/cards/CardList";
import List, { Sources as ListSources, State as ListState } from "../../lists/cards/CardList";
import { VNode } from "snabbdom/vnode";
import isolate from "@cycle/isolate";
import { CreateSetFormAction, SetForm } from "../../form/Set/SetForm";
import { ModalAction } from "cyclejs-modal";

export type StorePageSources = Sources & { onion: StateSource<StorePageState>, filter: any };
export interface StorePageState extends State {
    list: ListState;
}

export type Reducer = (prev?: StorePageState) => StorePageState | undefined;

export type Sources = {
    DOM: DOMSource;
    onion: StateSource<State>;
}

export type Sinks = {
    DOM: Stream<VNode>;
    onion: Stream<Reducer>;
}

export type Actions = {
    add$: Stream<string>,
    reorder$: Stream<any>
}

function intent(domSource: DOMSource): Actions {
    return {
        add$: domSource.select('.input').events('input')
            .map(inputEv => domSource.select('.add').events('click').mapTo(inputEv))
            .flatten()
            .map(inputEv => (inputEv.target as HTMLInputElement).value),
        reorder$: domSource.select('.reorder').events('click')
    };
}

function model(actions: Actions): Stream<Reducer> {
    const initReducer$ = xs.of(function initReducer(prev?: State): State {
        return {
            list: [],
        };
    });

    const addReducer$ = actions.add$
        .map(content => function addReducer(prevState: StorePageState): State {
            return {
                list: prevState.list.concat({
                    key: String(Date.now()),
                    id: 'idEingefügtÜberParent',
                    title: content,
                    showImport: true,
                    showRating: true
                }),
            };
        });

    const reorderReducer$ = actions.reorder$
        .map(content => function reOrder(prevState: StorePageState): State {
            console.log("Reorder");
            console.log(prevState.list);
            return {
                list: prevState.list.sort(function (a, b) {
                    if (a.content.title < b.content.title) return -1;
                    if (a.content.title > b.content.title) return 1;
                    return 0;
                })
            }
        })

    return xs.merge(initReducer$, addReducer$, reorderReducer$);
}

function view(listVNode$: Stream<VNode>): Stream<VNode> {
    return listVNode$.map(ulVNode =>
        div([
            span('New task:'),
            input('.input', {attrs: {type: 'text'}}),
            button('.add', 'Add'),
            button('.reorder', 'Reorder'),
            ulVNode
        ])
    );
}

export default function StorePage(sources: StorePageSources) {

    const state$ = sources.onion.state$.debug('STATE CHANGE!');

    const listSinks = isolate(List, 'list')(sources as any as ListSources);

    const action$ = intent(sources.DOM);
    const parentReducer$ = model(action$);
    const reducer$ = xs.merge(parentReducer$);
    const vdom$ = view(listSinks.DOM);

    const itemClick$ = listSinks.action
        .filter(action => action.type === 'click');

    const openModal$ = itemClick$.mapTo({
        type: 'open',
        props: {
            title: 'Set erstellen',
            action: {
                type: 'create',
            } as CreateSetFormAction
        },
        component: SetForm
    } as ModalAction);

    return {
        DOM_LEFT: vdom$,
        DOM_RIGHT: xs.of([]),
        onion: reducer$,
        modal: openModal$
    }

}