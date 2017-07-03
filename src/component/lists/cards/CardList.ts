import { Stream } from "xstream";
import { div, DOMSource, p, VNode } from "@cycle/dom";
import { StateSource } from "cycle-onionify";
import Item, { State as ItemState } from "./CardItem";

export type State = Array<ItemState & { key: string }>;

export type Reducer = (prev?: State) => State | undefined;

export type Sources = {
    DOM: DOMSource;
    onion: StateSource<State>;
}

export type Sinks = {
    DOM: Stream<VNode>;
    action: Stream<any>;
}

function view(itemVNodes: Array<VNode>) {

    const list = (itemVNodes.length === 0) ?
        div('.ui.column', p(['Keine Einträge vorhanden']))
        : itemVNodes;

    return div('.ui.three.column.doubling.stackable.grid',
        list
    )

}

export default function CardList(sources: Sources): Sinks {

    const items = sources.onion.toCollection(Item)
        .uniqueBy(s => s.key)
        .isolateEach(key => key)
        .build(sources);

    const vdom$ = items.pickCombine('DOM').map((itemVNodes: Array<VNode>) => view(itemVNodes));
    const action$ = items.pickMerge('action').debug('clicked!!!');

    return {
        DOM: vdom$,
        action: action$
    };

}