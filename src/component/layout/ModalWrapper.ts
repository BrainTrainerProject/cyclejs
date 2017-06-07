import { Component, Sinks, Sources } from "../../interfaces";
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

    console.log(props);
    const hasProps = !isNullOrUndefined(props);
    const title = (hasProps && !isNullOrUndefined(props.title)) ? props.title : "";

    const compSinks: Sinks = component({...sources});

    const extractedSinks: Sinks = extractSinks(
        xs.of(component),
        Object.keys(compSinks)
    );
    console.log(compSinks);
    console.log(extractedSinks);
    const closeClick$: Stream<ModalAction> = (sources.DOM as DOMSource).select('.close.icon')
        .events('click')
        .mapTo({type: "close"} as Close);

    let newSinks = {
        ...mergeSinks(extractedSinks, compSinks),
        DOM: compSinks.DOM.map(content =>
            // Semantic ui style
            div(".ui.modal.transition.visible.active", [
                i(".close.icon"),
                div(".header", [title]),
                div(".content", [content])
            ])
        ),
        modal: closeClick$.mapTo({type: "close"} as Close)
    };


    return Object.keys(newSinks)
        .map(k => ({[k]: adapt(newSinks[k])}))
        .reduce((<any>Object).assign, {});

}