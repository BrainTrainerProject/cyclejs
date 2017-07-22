import xs, { Stream } from 'xstream';
import { div, DOMSource, p, VNode } from '@cycle/dom';
import { StateSource } from 'cycle-onionify';
import { Component } from '../../common/interfaces';
import debounce from 'xstream/extra/debounce';

export type ListState = Array<{ key: string, item: any }>
export type Reducer = (prev?: ListState) => ListState | undefined;

export type Sources = {
    DOM: DOMSource;
    onion: StateSource<ListState>;
};

export type Sinks = {
    DOM: Stream<VNode>;
    callback$: Stream<any>;
};

function view(itemVNodes: Array<VNode>): Stream<VNode> {

    const items$ = xs.of(itemVNodes);

    const emptyList$ = items$
        .filter(items => !items || (items && items.length === 0))
        .mapTo(div('.ui.column', p(['Keine Einträge vorhanden'])));

    const list$ = items$
        .filter(items => (items && items.length > 0))
        .map(items => {
            return div('.ui.three.column.doubling.stackable.grid',
                items
            );
        });

    return xs.merge(emptyList$, list$);
}

export function StateList(sources: Sources, itemComponent: Component): Sinks {

    const items = sources.onion.toCollection(itemComponent)
        .uniqueBy(s => s.key)
        .isolateEach(key => key)
        .build(sources);

    const vdom$ = items.pickCombine('DOM')
        .startWith([])
        .compose(debounce(10))
        .map(view)
        .flatten();

    const callback$ = items.pickMerge('callback$');

    return {
        DOM: vdom$,
        callback$: callback$
    };

}