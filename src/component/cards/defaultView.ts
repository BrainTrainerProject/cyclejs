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



}