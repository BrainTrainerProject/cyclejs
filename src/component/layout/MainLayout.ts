import { div } from "@cycle/dom";
import xs, { Stream } from "xstream";
import { VNode } from "snabbdom/vnode";
import { Sidebar } from "./Sidebar";
import Masthead from "./Masthead";


export default function MainLayout(sources) {

    const sidebarSinks = Sidebar(sources);
    const mastheadSinks = Masthead(sources);

    const vdom$ = xs.combine(sidebarSinks.DOM, mastheadSinks.DOM);

    return (left: Stream<VNode>, right: Stream<VNode>) => {
        return {
            DOM: xs.combine(vdom$, left, right).map(view),
            router: sidebarSinks.router
        }
    }
}

function view([[sidebar, masthead], contentLeft, contentRight]) {

    return [
        sidebar,
        div('#main-container', [
            masthead,
            contentView(contentLeft, contentRight)
        ])
    ]

}

function contentView(contentLeftVNode: VNode, contentRightVNode: VNode) {
    return div("#content.ui.container.content-row", [
        contentRight(contentRightVNode),
        contentLeft(contentLeftVNode)
    ])
}

function contentRight(content: VNode) {
    return div("#content-right.ui.dividing.right.rail", content)
}

function contentLeft(content: VNode) {
    return div("#content-left.left-main", content)
}