import { Utils } from "../../../common/Utils";
import { a, div, i, img, span } from "@cycle/dom";
import xs from "xstream";

export interface CardItemProps {
    title: string
    imageUrl: string
    url: string
    rating: number
    ratingCount: number,
    showRating: boolean,
    showImport: boolean
}

const ID_CARD_CLICK = '.card-clicked';

export function CardItem(sources) {

    const {DOM, props$} = sources;

    // intent
    const linkClick$ = DOM.select(ID_CARD_CLICK).events('click').map(event => event.preventDefault());

    const clickStreams$ = linkClick$
        .map(s => props$.map(set => set._id))
        .flatten()
        .map(setId => '/set/' + setId);

    return {
        DOM: props$.map(set => {
            console.log("SET", set);
            return view({
                title: set.title,
                imageUrl: Utils.imageOrPlaceHolder(set.photourl),
                url: "/set/" + set._id,
                rating: 3,
                ratingCount: 42,
                showRating: set.showRating,
                showImport: set.showImport
            } as CardItemProps)
        }),
        router: clickStreams$
    };
}

function view(props: CardItemProps) {
    return div(".column", [
        div(".ui.card.fluid", [
            a(ID_CARD_CLICK + ".card-cover.image", {
                "attrs": {
                    "href": props.url
                }
            }, [
                img({
                    "attrs": {
                        "src": props.imageUrl
                    }
                })
            ]),
            div(".card-title.content", [
                a(ID_CARD_CLICK + ".header", {
                    "attrs": {
                        "href": props.url
                    }
                }, [props.title])
            ]),
            showExtraContent(props)
        ])
    ])
}

function showExtraContent(props: CardItemProps) {
    return (props.showImport || props.showRating) ? div(".extra.content", [

        (props.showImport) ? span(".right.floated", [
            a({
                "attrs": {
                    "href": "",
                    "stype": ""
                }
            }, [
                i(".download.icon")
            ])
        ]) : null,

        (props.showRating) ? div('ui', [div(".ui.rating", {
            "attrs": {
                "data-rating": props.rating,
                "data-max-rating": "5"
            },
            hook: {
                insert: (vnode) => {
                    $(vnode.elm).rating('disable')
                }
            }
        }),
            span('.rating-count', ['(' + props.ratingCount + ')'])
        ]) : null

    ]) : null
}

