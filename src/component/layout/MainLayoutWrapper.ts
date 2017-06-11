import { Component, Sinks } from "../../common/interfaces";
import { Sidebar } from "./Sidebar";
import Masthead from "./Masthead";
import xs from "xstream";
import { div } from "@cycle/dom";
import { VNode } from "snabbdom/vnode";
import { extractSinks, filterProp, mergeSinks } from "cyclejs-utils";
const R = require('ramda');


export function MainLayoutWrapper(component: Component) {

    return function (sources) {

        const sidebarSinks = Sidebar(sources);
        const mastheadSinks = Masthead(sources);

        const componentSinks = component(sources);

        const vdom$ = xs.combine(sidebarSinks.DOM, mastheadSinks.DOM);

        let mergedSinks = mergeSinks(sidebarSinks, mastheadSinks, componentSinks);
        mergedSinks = filterPropArray(mergedSinks, ['DOM_LEFT', 'DOM_RIGHT']);

        const sinks = {
            ...mergedSinks,
            DOM: xs.combine(
                vdom$,
                componentSinks.DOM_LEFT || xs.never(),
                componentSinks.DOM_RIGHT || xs.never()
            ).map(view),
        };

        return sinks;
    }
}

function filterPropArray(sinks, props: string[]) {
    let currSinks: Sinks = sinks;
    for (let prop of props) {
        currSinks = filterProp(extractSinks(xs.of(currSinks), Object.keys(currSinks)), prop)
    }
    return currSinks;
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