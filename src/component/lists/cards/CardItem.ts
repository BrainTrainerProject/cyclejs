import xs, { Stream } from "xstream";
import { a, div, DOMSource, i, img, span, VNode } from "@cycle/dom";
import { StateSource } from "cycle-onionify";
import { Utils } from "../../../common/Utils";

const ID_ITEM = '.card-clicked';
const ID_IMPORT = '.card-import';

export interface State {
    id: string,
    title: string,
    image: string,
    ownerId: string,
    rating: number,
    ratingCount: number,
    showRating: boolean,
    showImport: boolean,
}

export type Reducer = (prev?: State) => State | undefined;

export type Sources = {
    DOM: DOMSource;
    onion: StateSource<State>;
}

export type Sinks = {
    DOM: Stream<VNode>;
    action: Stream<any>;
}

function showExtraContent(state: State) {
    return (state.showImport || state.showRating) ? div(".extra.content", [

        (state.showImport) ? span(".right.floated", [
            a(ID_IMPORT, {attrs: {"href": "#"}}, [
                i(".download.icon")
            ])
        ]) : null,

        (state.showRating) ? div('ui', [div(".ui.rating", {
            "attrs": {
                "data-rating": state.rating,
                "data-max-rating": "5"
            },
            hook: {
                insert: (vnode) => {
                    $(vnode.elm).rating('disable')
                }
            }
        }),
            span('.rating-count', ['(' + state.ratingCount + ')'])
        ]) : null

    ]) : null
}

function cardView(state$) {
    return state$.map(state => {

        return div(".column", [
            div(".ui.card.fluid", [
                a(ID_ITEM + ".card-cover.image", {
                    "attrs": {
                        "href": state.url
                    }
                }, [
                    img({
                        "attrs": {
                            "src": Utils.imageOrPlaceHolder(state.image)
                        }
                    })
                ]),
                div(".card-title.content", [
                    a(ID_ITEM + ".header", {
                        "attrs": {
                            "href": state.url
                        }
                    }, [state.title])
                ]),
                showExtraContent(state)
            ])
        ])

    });
}

export default function CardItem(sources: Sources): Sinks {

    const state$ = sources.onion.state$;

    const itemClick$ = sources.DOM.select(ID_ITEM).events('click')
        .map(e => e.preventDefault())
        .mapTo(state$)
        .flatten()
        .map(item => ({
                type: 'click',
                item: item
            })
        );

    const importClick$ = sources.DOM.select(ID_IMPORT).events('click')
        .map(e => e.preventDefault())
        .mapTo(state$)
        .flatten()
        .map(item => ({
                type: 'import',
                item: item
            })
        );

    const vdom$ = cardView(state$);

    return {
        DOM: vdom$,
        action: xs.merge(itemClick$, importClick$)
    };

}