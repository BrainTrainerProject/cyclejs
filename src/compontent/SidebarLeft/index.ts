import {button, DOMSource} from "@cycle/dom";
import {Stream} from "xstream";
import {VNode} from "snabbdom/vnode";

export type Sources = {
    DOM: DOMSource,
};
export type Sinks = {
    DOM: Stream<VNode>,
};

function SidebarLeft(sources: Sources): Sinks {

    const click$ = sources.DOM.select('.click-sidebar-left').events('click')
        .map(x => {
            alert("SidebarLeft!")
            return x;
        }).startWith(null);

    const DOM = click$.map(j =>
        button('.click-sidebar-left', ['Linker Knopf'])
    );

    return {DOM}
}

export default SidebarLeft;