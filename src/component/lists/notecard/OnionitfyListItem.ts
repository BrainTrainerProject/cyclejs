import xs from 'xstream';
import {button, li, span} from '@cycle/dom';
import {Sinks, Sources, State} from '../../../common/interfaces';

export interface ListItemState {
    content: string;
}

export default function ListItem(sources: Sources): Sinks {

    const state$ = sources.onion.state$;

    const vdom$ = state$.map(state =>
        li('.item', [
            span('.content', `${state.content} `),
            span('.delete', '(delete)'),
            button('.decrement', 'Decrement'),
            button('.increment', 'Increment'),
            span('.count', `${state.count}`)
        ])
    );

    const removeReducer$ = sources.DOM
        .select('.delete').events('click')
        .mapTo(function removeReducer(prevState: State): State {
            return void 0;
        });

    const counterReducer$ = xs.merge(
        sources.DOM.select('.increment').events('click').mapTo(+1),
        sources.DOM.select('.decrement').events('click').mapTo(-1),
    ).map(delta => function counterReducer(prev: State): State {
        return Object.assign({}, prev, {count: prev.count + delta});
    });

    const reducer$ = xs.merge(removeReducer$, counterReducer$);

    return {
        DOM: vdom$,
        onion: reducer$
    };
}