import xs, { Stream } from "xstream";
import { a, div, i, img, p } from "@cycle/dom";
import NotecardForm, { NotecardFormSinks } from "../form/NotecardForm/index";
import isolate from "@cycle/isolate";
import { Reducer, Sinks, Sources, State } from "../../interfaces";
import { StateSource } from "cycle-onionify";
import { extractSinks, mergeSinks } from "cyclejs-utils";
import { adapt } from "@cycle/run/lib/adapt";
import { VNode } from "snabbdom/vnode";
import { MainSinks } from "../../main";

export type ModalSource = Sources & { onion: StateSource<ModalState> };
export type ModalSinks = Sinks & { onion: Stream<Reducer> };
export interface ModalState extends State {
}

export function ModalComponent(sources: ModalSource, sinks: MainSinks): ModalSinks {

    const state$ = sources.onion.state$;

    const modalRequest$ = sources.MODAL.request();
    const emptySinks = {
        DOM: xs.never(),

    }

    const modal$ = modalRequest$.map(req => {
        console.log("Request in ModalComponent");
        console.log(req);
        //if (req.type === 'open') {
        console.log("Open");
        return xs.of(isolate(req.component, {onion: 'modal'})(sources));
        //}
        //return xs.never()
    }).startWith(xs.of(null));
    const notecardFormSinks: NotecardFormSinks = isolate(NotecardForm, {onion: 'modal'})(sources);

    const testModal$ = xs.of(isolate(NotecardForm, {onion: 'modal'})(sources));

    const extractedSinks: ModalSinks = extractSinks(
        modal$, Object.keys(notecardFormSinks)
    );

    const vdom$: Stream<VNode> = modal$
        .map(dom => {

            const getDOM$ = dom.map(content => {
                console.log("DOM");
                console.log(content);
                if (content === null) {
                    return null;
                } else {
                    return content.DOM
                }
            });

            const vmodel$$ = getDOM$.map(dom => {
                console.log("vmodel");
                console.log(dom);
                if (dom == null) {
                    return xs.of(div(["MODAL EMPTY"]));
                } else {
                    return dom.map(content => {
                        console.log(content);
                        return div(".ui.dimmer.modals.page.transition.visible active", [
                            div("#main-modal.ui.fullscreen.modal.transition.visible.active.scrolling", {
                                /*"style": {
                                    "name": "style",
                                    "value": "margin-top: -198.93px; display: block !important;"
                                }*/
                                hook: {
                                    insert: (vnode) => { console.log("Insert!") }
                                }
                            }, [
                                i(".close.icon"),
                                div(".header", [`Update Your Settings`]),
                                div(".content", [content]),
                                div(".actions", [
                                    div(".ui.button", [`Cancel`]),
                                    div(".ui.green.button", [`Send`])
                                ])
                            ])
                        ])
                    })
                }
            });

            return vmodel$$.flatten();
        })
        .flatten()
        .map(div);

    const mergedSinks = {
        ...mergeSinks(extractedSinks, sinks),
        DOM: vdom$
    };

    //const newSinks = Object.assign({}, notecardFormSinks, extractedSinks);
    const newSinks = Object.keys(mergedSinks)
        .map(k => ({[k]: adapt(mergedSinks[k])}))
        .reduce(Object.assign, {});

    console.log("New Sinks");
    console.log(newSinks);


    /*const notecardVDom$: Stream<VNode> = notecardFormSinks.DOM;
     const notecardReducer$ = notecardFormSinks.onion;
     const notecardHTTP$ = notecardFormSinks.HTTP;

     //const vdom$ = view(notecardVDom$)
     const reducer$ = notecardReducer$
     const http$ = notecardHTTP$
     const vdom$ = xs.of(null);
     //const vdom$ = notecardVDom$.map(content => div("#main-modal.ui.standard.modal.transition.visible.scrolling", [content]));*/

    /*const sinks: Sinks = {...sources};


     const child$ : Stream<Sinks> = children$.map(arr => mergeSinks(...arr));

     */
    /*const extractedSinks: Sinks = extractSinks(
     xs.of(notecardFormSinks),
     Object.keys(sinks)
     );
     const newSinks = {
     ...mergeSinks(extractedSinks, sinks),
     DOM: xs.of(div(['test']))
     };*/

    /*const sinks = {
     DOM: sources.DOM,
     HTTP: http$,
     onion: reducer$,
     MODAL: modal$
     };
     */
    /*sinks = Object.assign({}, sources, notecardFormSinks);
     sinks = Object.assign({}, sinks, {DOM: xs.of(div(['test'])), MODAL: xs.of(sources.MODAL)});*/
    //console.log(newSinks);
    //console.log(sinks)
    /*const nn = Object.keys(newSinks)
     .map(k => ({[k]: adapt(newSinks[k])}))
     .reduce(Object.assign, {});
     console.log(nn);
     */
    console.log({
        DOM: newSinks.DOM,
        HTTP: notecardFormSinks.HTTP,
        onion: notecardFormSinks.onion,
        MODAL: modal$
    });
    return {
        DOM: newSinks.DOM,
        HTTP: newSinks.HTTP,
        onion: notecardFormSinks.onion,
        MODAL: modal$
    };
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