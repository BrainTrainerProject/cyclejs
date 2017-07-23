import { DOMSource } from '@cycle/dom';
import { StateSource } from 'cycle-onionify';
import { Component } from '../../common/interfaces';
import debounce from 'xstream/extra/debounce';
import { StateListItemSinks } from "./StateListItem";
import isolate from "@cycle/isolate";

export type ListState = Array<{ key: string, item: any }>
export type Reducer = (prev?: ListState) => ListState | undefined;

export type Sources = {
    DOM: DOMSource;
    onion: StateSource<ListState>;
};

export type Sinks = StateListItemSinks

export function StateList(sources: Sources, itemComponent: Component): Sinks {

    const items = sources.onion.toCollection(itemComponent)
        .uniqueBy(s => s.key)
        .isolateEach(key => 'item')
        .build(sources);

    const vdom$ = items.pickCombine('DOM')
        .startWith([])
        .compose(debounce(10));

    const callback$ = items.pickMerge('callback$');
    const http$ = items.pickMerge('HTTP');
    const reducer$ = items.pickMerge('reducer').debug('statelist reducer');

    return {
        DOM: vdom$,
        HTTP: http$,
        reducer: reducer$,
        callback$: callback$
    };

}