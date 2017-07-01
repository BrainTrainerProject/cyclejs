import xs from 'xstream';
import isolate from '@cycle/isolate';
import {div, ul} from '@cycle/dom';
import {Lens, mix, pick} from 'cycle-onionify';
import {Sinks, Sources, State} from '../../../common/interfaces';
import Item, {ListItemState as ItemState} from './OnionitfyListItem';
import ListItem, {ListItemState} from './OnionitfyListItem';

export type State = {
    list: Array<ItemState>;
};

export default function List(sources: Sources): Sinks {

    console.log('Call list');
    console.log(sources);

    // Get specific item
    const itemLens = (index: number): Lens<State, ItemState> => {

        return {
            // ChildState
            get: state => ({
                content: state.list[index].content
            }),
            set: (state, childState) => {

                if (!childState) {
                    return {
                        list: state.list.filter((val: any, i: number) => i !== index)
                    };
                } else {
                    const newItem = {content: childState};
                    return {
                        list: state.list.map((val: any, i: number) => i === index ? newItem : val)
                    };
                }

            }
        };

    };

    const state$ = sources.onion.state$.debug("List state");

    const childrenSinks$ = state$.map(state => {
        return state.list.map((item: any, i: number) => {
            return isolate(ListItem, {onion: itemLens(i)})(sources as any as Sources);
        });
    });

    const vdom$ = childrenSinks$
        .compose(pick('DOM'))
        .compose(mix(xs.combine))
        .map(itemVNodes => ul(itemVNodes))
        .startWith(null);

    const reducer$ = childrenSinks$
        .compose(pick('onion'))
        .compose(mix(xs.merge));

    return {
        DOM: xs.combine(xs.of(div(['TEST'])), vdom$).map(([div1, div2]) => [div1, div2]),
        onion: reducer$
    };
}