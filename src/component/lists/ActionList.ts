import xs, {Stream} from 'xstream';
import {div, DOMSource, p, VNode} from '@cycle/dom';
import {StateSource} from 'cycle-onionify';
import {State as ItemState} from './sets/SetsItem';
import {Component} from '../../common/interfaces';
import debounce from 'xstream/extra/debounce';

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

export default function ActionList(sources: Sources, itemComponent: Component): Sinks {

    const items = sources.onion.toCollection(itemComponent)
        .uniqueBy(s => s.key)
        .isolateEach(key => key)
        .build(sources);

    const vdom$ = items.pickCombine('DOM')
        .startWith([])
        .compose(debounce(10))
        .map(view)
        .flatten();

    const action$ = items.pickMerge('action');

    return {
        DOM: vdom$,
        action: action$
    };

}