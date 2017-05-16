import {div, DOMSource, makeDOMDriver} from "@cycle/dom";
import xs, {Stream} from "xstream";
import {VNode} from "snabbdom/vnode";
import {run} from "@cycle/run";
import SidebarLeft from "./compontent/SidebarLeft/index";
import SidebarRight from "./compontent/SidebarRight/index";
import CenterContent from "./compontent/ContentCenter/index";

export type Sources = {
    DOM: DOMSource,
};

export type Sinks = {
    DOM: Stream<VNode>,
};

function Main(sources: Sources): Sinks {

    const sidebarLeft$ = SidebarLeft(sources);
    const centerContent$ = CenterContent(sources);
    const sidebarRight$ = SidebarRight(sources);

    const combineViews$ = xs.combine(sidebarLeft$.DOM, centerContent$.DOM, sidebarRight$.DOM)
        .map(([sidebarLeft, center, sidebarRight]) => div('.main', [
            div('.left', {style: {color: ''}}, [sidebarLeft]),
            div('.center', [center]),
            div('.right', [sidebarRight])
        ]));

    return {DOM: combineViews$}
}

run(Main, {
    DOM: makeDOMDriver("#app")
});