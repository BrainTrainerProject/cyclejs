import xs from "xstream";
import { a, div, img } from "@cycle/dom";

export function Sidebar(sources) {

    // intent & model
    const headerClick$ = sources.DOM.select('.logo a').events('click').map(e => e.preventDefault()).mapTo('/start');
    const startClick$ = sources.DOM.select('.nav-start').events('click').mapTo('/start');
    const feedClick$ = sources.DOM.select('.nav-feed').events('click').mapTo('/feed');
    const storeClick$ = sources.DOM.select('.nav-store').events('click').mapTo('/store');

    const route$ = xs.merge(headerClick$, startClick$, feedClick$, storeClick$);

    const sinks = {
        DOM: xs.of(
            div("#main-sidebar.toc", [
                div(".ui.vertical.sticky.menu.border-less", [
                    div(".logo", [
                        a({
                            "attrs": {
                                "href": "/start"
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
                        a(".nav-start.active.item", ['Start']),
                        a(".nav-feed.item", ['Feed', div(".ui.label", [`1`])]),
                        a(".nav-store.item", ['Store'])
                    ])
                ])
            ])
        ),
        router: route$
    };

    return sinks;
}