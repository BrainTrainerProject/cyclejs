import xs from "xstream";
import { a, div, i, img, p } from "@cycle/dom";

export function Modal(sources) {



    const sinks = {
        DOM: xs.of(
            /*.ui.dimmer.modals.page.transition.visible.active*/
            div(".ui.dimmer.modals.page.transition", {
                "attrs": {
                    "className": "ui dimmer modals page transition visible active"
                },
                "style": {
                    "name": "style",
                    "value": "display: block !important;"
                }
            }, [
                div("#main-modal.ui.standard.test.modal.transition.visible.active", [
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
                ])
            ])
        )
    }

    return sinks;
}