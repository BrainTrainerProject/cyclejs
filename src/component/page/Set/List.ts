import xs, {Stream} from 'xstream';
import isolate from '@cycle/isolate';
import {div, DOMSource, p, VNode} from '@cycle/dom';
import {Lens, mix, pick, StateSource} from 'cycle-onionify';
import Item, {State as ItemState} from './Item';
import {Utils} from '../../../common/Utils';
import {HTTPSource} from '@cycle/http';
import {CreateSetFormAction, SetForm} from '../../form/Set/set-form';

export type State = Array<ItemState>;

export type Reducer = (prev?: State) => State | undefined;

export type Sources = {
    DOM: DOMSource;
    HTTP: HTTPSource;
    onion: StateSource<State>;
};

export type Sinks = {
    DOM: Stream<VNode>;
    onion: Stream<Reducer>;
    modal: Stream<any>;
};

function itemLens(index): Lens<State, ItemState> {
    return {
        get: state => state[index],
        set: (state, childState) => state
    };
}

export default function List(sources: Sources): Sinks {

    console.log('Call List');

    const list$ = sources.onion.state$;
    // TODO will, den modal öfnen aber dann kommt erst der fehler
    // sprich vllt funktinoert der click
    // TODO item lens ausprobieren und ob der clickevent auch ausgelöst wird !!! dann könnte man andere struktueren nustzen
    // TODO SCOPE IRGENDWIE IN ORDNUNG BRINGEN
    // LISTE VIELLEICHT OHNE "EXTRAS" einfach nur eine liste?
    // isolate { notecards: { 0:{...}, 1:{...} }
    // index == scope
    // TODO !!!!! LAST CHANGE ITEMLENS EINGEFÜGTnpm run web

    const childrenSinks$ = list$.map(array =>
        array.map((item, i) => isolate(Item, i)(sources))
    );

    const vdom$ = childrenSinks$
        .compose(pick('DOM'))
        .compose(mix(xs.combine))
        .map(itemVNodes => view(itemVNodes))
        .startWith(div(['Loading ...']));

    const click$ = childrenSinks$
        .compose(pick(sinks => sinks.click))
        .compose(mix(xs.merge));

    const action$ = childrenSinks$
        .compose(pick(sinks => sinks.action))
        .compose(mix(xs.merge));

    const itemReducer$ = childrenSinks$
        .compose(pick('onion'))
        .compose(mix(xs.merge));

    // init empty array
    const initReducer$ = xs.of((state) => ([]));

    const openModal$ = click$
        .mapTo({
            type: 'open',
            props: {
                title: 'Set erstellen',
                action: {
                    type: 'create'
                } as CreateSetFormAction
            },
            component: SetForm
        }).debug('CLICK?');

    // load dummy data
    const arrReducer$ = xs.fromArray([
        {id: 1, image: Utils.imageOrPlaceHolder(null), title: 'Title 1', owner: 'Ich'},
        {id: 2, image: Utils.imageOrPlaceHolder(null), title: 'Title 2', owner: 'Ich'},
        {id: 3, image: Utils.imageOrPlaceHolder(null), title: 'Meine Notecard!', owner: '594a9b0ef8c8320001b6058c'}
    ]).map(notecard => (state) => state.concat(notecard));


    return {
        DOM: vdom$,
        onion: xs.merge(initReducer$, arrReducer$),
        modal: openModal$
    };
}

function view(vnodes) {

    const list = (vnodes && vnodes.length === 0) ?
        div('.ui.column', p(['Keine Einträge vorhanden']))
        : vnodes;

    return div('.ui.three.column.doubling.stackable.grid',
        list
    );
}