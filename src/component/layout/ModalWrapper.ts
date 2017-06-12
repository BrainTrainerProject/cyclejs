import { Component, Sinks, Sources } from "../../common/interfaces";
import { isNullOrUndefined } from "util";
import { extractSinks, mergeSinks } from "cyclejs-utils";
import xs, { Stream } from "xstream";
import { div, DOMSource, i } from "@cycle/dom";
import { adapt } from "@cycle/run/lib/adapt";
import { Close, ModalAction, Props } from "cyclejs-modal";

export interface ModalProps extends Props {
    title: string
}

export function ModalWrapper(sources: Sources, component: Component, props: ModalProps): Sinks {

    const hasProps = !isNullOrUndefined(props);
    const title = (hasProps && !isNullOrUndefined(props.title)) ? props.title : "";

    const compSinks: Sinks = component(sources);

    const closeClick$: Stream<ModalAction> = (sources.DOM as DOMSource).select('.close.icon')
        .events('click')
        .mapTo({type: "close"} as Close);

    const sinks = {
            ...compSinks,
        DOM: compSinks.DOM.map(content =>
            // Semantic ui style
            div(".ui.modal.transition.visible.active", [
                i(".close.icon"),
                div(".header", [title]),
                div(".content", [content])
            ])
        ),
        modal: xs.merge(compSinks.modal || xs.empty(), closeClick$.mapTo({type: "close"} as Close))
    };

    console.log("Modal Wrapper Sinks");
    console.log(sinks);

    return sinks;

}