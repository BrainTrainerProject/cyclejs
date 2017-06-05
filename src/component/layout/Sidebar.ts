import xs from "xstream";
import { a, div, img } from "@cycle/dom";
export function Sidebar(sources) {

    const sinks = {
        DOM: xs.of(
            div("#main-sidebar.toc", [
                div(".ui.vertical.sticky.menu.border-less", [
                    div(".logo", [
                        a({
                            "attrs": {
                                "href": "/"
                            }
                        }, [
                            img({
                                "attrs": {
                                    "src": "/src/img/logo.png"
                                }
                            })
                        ])
                    ]),
                    div(".ui.secondary.vertical.menu", [
                        a(".active.item", [`Start`]),
                        a(".item", [
                            `Feed`,
                            div(".ui.label", [`1`])
                        ]),
                        a(".item", [`Store`])
                    ])
                ])
            ])
        )
    };

    return sinks;
}