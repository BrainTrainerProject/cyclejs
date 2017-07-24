import xs, { Stream } from 'xstream';
import { a, div, DOMSource, i, img, span, VNode } from '@cycle/dom';
import { StateSource } from 'cycle-onionify';
import { Utils } from '../../common/Utils';
import { Rating } from "../../common/ui/Rating";
import { StateListItemSinks } from "./StateListItem";

const ID_ITEM = '.card-clicked';
const ID_IMPORT = '.card-import';

export interface State {
    id: string;
    title: string;
    image: string;
    ownerId: string;
    rating: number;
    ratingCount: number;
    showRating: boolean;
    showImport: boolean;
}

export type Reducer = (prev?: State) => State | undefined;

export type Sources = {
    DOM: DOMSource;
    onion: StateSource<State>;
};

export type Sinks = {
    DOM: Stream<VNode>;
    callback$: Stream<any>;
};

export function CardItem(sources: Sources): StateListItemSinks {

    const state$ = sources.onion.state$;

    const actions = intent(sources);
    const reducer = model(actions, state$);

    const vdom$ = cardView(state$);

    return {
        DOM: vdom$,
        HTTP: xs.never(),
        reducer: xs.never(),
        callback$: reducer.callback$
    };

}

function intent(sources: any): any {

    const itemClick$ = sources.DOM.select(ID_ITEM).events('click')
        .map(e => e.preventDefault());

    const importClick$ = sources.DOM.select(ID_IMPORT).events('click')
        .map(e => e.preventDefault());

    return {itemClick$, importClick$};
}

function model(actions: any, state$: Stream<any>): any {

    const itemClick$ = actions.itemClick$
        .mapTo(state$)
        .flatten()
        .map(state => {
                return ({
                    type: 'click',
                    item: state.item
                });
            }
        );

    const importClick$ = actions.importClick$
        .mapTo(state$)
        .flatten()
        .map(state => ({
                type: 'import',
                item: state.item
            })
        );

    return {
        callback$: xs.merge(itemClick$, importClick$)
    };

}

function cardView(state$: Stream<any>): any {


    return state$.map(state => {

        const item = state.item;
        console.log("CardItem CC", state)

        return div('.column', [
            div('.ui.card.fluid', [
                a(ID_ITEM + '.card-cover.image', {
                    attrs: {href: item.url}
                }, [
                    img({
                        attrs: {src: Utils.imageOrPlaceHolder(item.photourl)}
                    })
                ]),
                div('.card-title.content', [
                    a(ID_ITEM + '.header', {
                        attrs: {href: item.url}
                    }, [item.title])
                ]),
                showExtraContent(state)
            ])
        ]);

    });
}

function showExtraContent(state: any): VNode {

    const item = state.item;

    return (state.showImport || state.showRating) ? div('.extra.content', [

        (state.showImport) ? span('.right.floated', [
            a(ID_IMPORT, {attrs: {'href': '#'}}, [
                i('.download.icon')
            ])
        ]) : null,

        (state.showRating) ? Rating(item.rating, item.valuations.length) : null

    ]) : null;
}