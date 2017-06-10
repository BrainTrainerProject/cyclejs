import { VNode } from "snabbdom/vnode";
import { a, div, img } from "@cycle/dom";

export interface DefaultViewProps {
    title: string
    imageUrl: string
    url: string
    rating: number
    ratingCount: number
}

export function defaultView(props: DefaultViewProps): VNode {

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
                    }
                }),
                '(' + props.ratingCount + ')'
            ])
        ])
    ])

}