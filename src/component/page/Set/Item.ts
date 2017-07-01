import xs, {Stream} from 'xstream';
import {a, div, DOMSource, img, VNode} from '@cycle/dom';
import {StateSource} from 'cycle-onionify';

export interface State {
    id: string;
    title: string;
    image: string;
    owner: string;
}

export type Reducer = (prev?: State) => State | undefined;

export type Sources = {
    DOM: DOMSource;
    onion: StateSource<State>;
};

export type Sinks = {
    DOM: Stream<VNode>;
    onion: Stream<Reducer>;
    click: Stream<any>;
    action: Stream<any>;
};

const ID_CLICK = '.click-id';

export default function Item(sources: Sources): Sinks {

    console.log('Child Item');

    const state$ = sources.onion.state$.debug('CHildITEM STATE');

    const vdom$ = state$.map(view);

    const reducer$ = sources.DOM
        .select('.delete').events('click')
        .mapTo(function removeReducer(prevState: State): State {
            return void 0;
        });

    const action$ = sources.DOM.select(ID_CLICK).events('click').map(e => {
        e.preventDefault();
        return e;
    })
        .mapTo(state$.map(state => state.id))
        .flatten()

    return {
        DOM: vdom$,
        click: sources.DOM.select(ID_CLICK).events('click'),
        action: action$.mapTo({type: 'modal', id: '123'}),
        onion: xs.never()
    };

}

function view(state: State) {

    console.log('Item View', state);

    if (!state) {
        return div('.column', [div('.ui.card.fluid', ['...'])]);
    }

    return div('.column', [
        div('.ui.card.fluid', [
            a(ID_CLICK + '.card-cover.image', {
                attrs: {
                    href: '#'
                }
            }, [
                img({
                    'attrs': {
                        'src': state.image
                    }
                })
            ]),
            div('.card-title.content', [
                a(ID_CLICK + '.header', [state.title])
            ])
        ])
    ]);

}