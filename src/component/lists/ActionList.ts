import { Stream } from 'xstream';
import { div, DOMSource, p, VNode } from '@cycle/dom';
import { StateSource } from 'cycle-onionify';
import Item, {State as ItemState } from './sets/SetsItem';
import { Component } from '../../common/interfaces';

export type State = Array<{ key: string, item: ItemState }>;

export type Reducer = (prev?: State) => State | undefined;

export type Sources = {
    DOM: DOMSource;
    onion: StateSource<State>;
};

export type Sinks = {
    DOM: Stream<VNode>;
    action: Stream<any>;
};

function view(itemVNodes: Array<VNode>) {

    const list = (itemVNodes.length === 0) ?
        div('.ui.column', p(['Keine Einträge vorhanden']))
        : itemVNodes;

    return div('.ui.three.column.doubling.stackable.grid',
        list
    );

}

export default function ActionList(sources: Sources, itemComponent: Component): Sinks {

    const items = sources.onion.toCollection(itemComponent)
        .uniqueBy(s => s.key)
        .isolateEach(key => key)
        .build(sources);

    const vdom$ = items.pickCombine('DOM').map((itemVNodes: Array<VNode>) => view(itemVNodes));
    const action$ = items.pickMerge('action');

    return {
        DOM: vdom$,
        action: action$
    };

}