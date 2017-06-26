import { Sinks, Sources } from "../../common/interfaces";
import { Sidebar } from "./Sidebar";
import Masthead from "./Masthead/Masthead";
import xs, { Stream } from "xstream";
import { div } from "@cycle/dom";
import { VNode } from "snabbdom/vnode";
import { mergeSinks } from "cyclejs-utils";
import { Utils } from "../../common/Utils";
import isolate  from "@cycle/isolate";
import { ModalAction } from "cyclejs-modal";
import { CreateSetFormAction, SetForm } from "../form/Set/SetForm";
import { isolateSink } from "@cycle/http/lib/isolate";
const R = require('ramda');

export type MainLayoutSources = Sources & {};
export type MainLayoutSinks = Sinks & { DOM_LEFT: Stream<VNode>, DOM_RIGHT: Stream<VNode> };
export type MainLayoutComponent = (s: MainLayoutSources) => MainLayoutSinks;

export function MainLayoutWrapper(component: MainLayoutComponent) {

    return function (sources: MainLayoutSources) {

        const sidebarSinks = Sidebar(sources);
        const mastheadSinks = Masthead(sources);

        const componentSinks = component(sources);
        console.log(componentSinks);

        const vdom$ = xs.combine(sidebarSinks.DOM, mastheadSinks.DOM);

        let mergedSinks = mergeSinks(sidebarSinks, mastheadSinks, componentSinks);
        mergedSinks = Utils.filterPropsByArray(mergedSinks, ['DOM_LEFT', 'DOM_RIGHT']);

        console.log(mergedSinks);

        const sinks = {
            ...mergedSinks,
            DOM: xs.combine(
                vdom$,
                componentSinks.DOM_LEFT || xs.never(),
                componentSinks.DOM_RIGHT || xs.never()
            ).map(view)
        };

        return sinks;
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