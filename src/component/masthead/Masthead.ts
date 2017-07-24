import { div } from "@cycle/dom";
import xs from "xstream";
import MastheadProfil from "./MastheadProfil";
import MastheadFilter from "./MastheadFilter";
import MastheadSearch from "./MastheadSearch";

export default function Masthead(sources) {

    const searchSinks = MastheadSearch(sources);
    const filterSinks = MastheadFilter(sources);
    const profileSinks = MastheadProfil(sources);

    const routeChange$ = sources.router.history$.map(s => {
        return s;
    });

    return {
        DOM: xs.combine(searchSinks.DOM, profileSinks.DOM, filterSinks.DOM).map(view),
        router: xs.merge(profileSinks.router, routeChange$, searchSinks.router),
        filter: searchSinks.filter,
        modal: profileSinks.modal,
        onion: profileSinks.onion,
        HTTP: profileSinks.HTTP
    }

}

function view([search, profile, filter]) {
    return div("#masthead.ui.container", [
        div(".ui.container.content-row-flexible", [
            search,
            profile
        ]),
        div(".ui.container.content-row", [
            filter,
            div(".ui.divider")
        ])
    ])

}