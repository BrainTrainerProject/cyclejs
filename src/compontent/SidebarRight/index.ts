import {button, DOMSource} from "@cycle/dom";
import {Stream} from "xstream";
import {VNode} from "snabbdom/vnode";

export type Sources = {
    DOM: DOMSource,
};
export type Sinks = {
    DOM: Stream<VNode>,
};

function SidebarRight(sources: Sources): Sinks {

    const click$ = sources.DOM.select('.click-sidebar-right').events('click')
        .map(x => {
            alert("SidebarRight!")
            return x;
        }).startWith(null);

    const DOM = click$.map(j =>
        button('.click-sidebar-right', ['Rechter Knopf'])
    );

    return {DOM}
}

export default SidebarRight;