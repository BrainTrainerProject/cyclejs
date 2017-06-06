import xs, { Stream } from "xstream";
import { a, div, i, img, p, span } from "@cycle/dom";
import NotecardForm, { NotecardFormSinks } from "../form/NotecardForm/index";
import isolate  from "@cycle/isolate";
import { VNode } from "snabbdom/vnode";

export function ModalComponent(sources) {

    const state$ = sources.onion.state$;

    const modal$ = sources.MODAL.get().map

    const notecardFormSinks: NotecardFormSinks = isolate(NotecardForm, {onion: 'modal'})(sources);
    const notecardVDom$: Stream<VNode> = notecardFormSinks.DOM;
    const notecardReducer$ = notecardFormSinks.onion;
    const notecardHTTP$ = notecardFormSinks.HTTP;

    //const vdom$ = view(notecardVDom$)
    const reducer$ = notecardReducer$
    const http$ = notecardHTTP$
    const vdom$ = xs.of(null);
    //const vdom$ = notecardVDom$.map(content => div("#main-modal.ui.standard.modal.transition.visible.scrolling", [content]));

    const sinks = {
        DOM: vdom$,
        HTTP: http$,
        onion: reducer$,
        MODAL: modal$
    };

    return sinks;
}

function xx() {
    i(".close.icon"),
        div(".header", [`Profile Picture`]),
        div(".image.content", [
            div(".ui.medium.image", [
                img({
                    "attributes": {
                        "src": "/images/avatar/large/chris.jpg"
                    }
                })
            ]),
            div(".description", [
                div(".ui.header", [`We've auto-chosen a profile image for you.`]),
                p([
                    `We've grabbed the following image from the `,
                    a({
                        "attributes": {
                            "href": "https://www.gravatar.com",
                            "target": "_blank"
                        }
                    }, [`gravatar`]),
                    ` image associated with your registered e-mail address.`
                ]),
                p([`Is it okay to use this photo?`])
            ])
        ]),
        div(".actions", [
            div(".ui.black.deny.button", [`Nope`]),
            div(".ui.positive.right.labeled.icon.button", [
                `Yep, that's me`,
                i(".checkmark.icon")
            ])
        ])
}