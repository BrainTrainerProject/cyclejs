import { Utils } from "../../../common/Utils";
import { a, div, img } from "@cycle/dom";

export interface CardItemProps {
    title: string
    imageUrl: string
    url: string
    rating: number
    ratingCount: number
}

export function CardItem(sources) {
    const props$ = sources.props$;
    return {
        DOM: props$.map(set => {
            return view({
                title: set.title,
                imageUrl: Utils.imageUrl('/card-placeholder.png'),
                url: "/set/" + set._id,
                rating: 3,
                ratingCount: 42
            } as CardItemProps)
        })
    };
}

function view(props: CardItemProps) {
    return div(".column", [
        div(".ui.card.fluid", [
            a(".card-cover.image", {
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
                a(".header", {
                    "attrs": {
                        "href": props.url
                    }
                }, [props.title])
            ]),
            div(".extra.content", [
                div(".ui.rating.disabled", {
                    "attrs": {
                        "data-rating": "" + props.rating + "",
                        "data-max-rating": "5"
                    },
                    hook: {
                        insert: (vnode) => {
                            $(vnode).rating('disable')
                        }
                    }
                }),
                '(' + props.ratingCount + ')'
            ])
        ])
    ])
}

