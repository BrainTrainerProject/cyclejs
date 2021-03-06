import xs from "xstream";
import { a, div, img } from "@cycle/dom";
import sampleCombine from "xstream/extra/sampleCombine";

const Route = require('route-parser');

export function Sidebar(sources) {

    const path$ = sources.router.history$;
    const state$ = sources.onion.state$;

    console.log('SIDEBAR', sources.socket);

    const newFeeds$ = sources.socket.get('new_set');

    // intent & model
    const headerClick$ = sources.DOM.select('.logo a').events('click').map(e => e.preventDefault()).mapTo('/start');
    const startClick$ = sources.DOM.select('.nav-start').events('click').mapTo('/start');
    const feedClick$ = sources.DOM.select('.nav-feed').events('click').mapTo('/feed');
    const storeClick$ = sources.DOM.select('.nav-store').events('click').mapTo('/store');

    const route$ = xs.merge(headerClick$, startClick$, feedClick$, storeClick$);

    const naviReducer$ = path$
        .startWith('/start')
        .map(v => v.pathname)
        .map(path => {
            const route = new Route('/:root');
            return route.match(path);
        });

    const vdom$ = newFeeds$
        .startWith(null)
        .compose(sampleCombine(naviReducer$))
        .map(([feed, path]) => {

            console.log("PPATH", path);
            console.log("FEED SOCKET", feed);

            let showFeed = feed !== null;

            return div("#main-sidebar.toc", [
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
                        a(".nav-start.item", {class: {active: path.root === 'start'}}, ['Start']),
                        a(".nav-feed.item", {class: {active: path.root === 'feed'}}, ['Feed', (showFeed) ? div(".ui.label", []) : null]),
                        a(".nav-store.item", {class: {active: path.root === 'store'}}, ['Store'])
                    ])
                ])
            ])

        })

    const sinks = {
        DOM: vdom$,
        router: route$
    };

    return sinks;
}