import xs, { Stream } from "xstream";
import { AppSinks, AppSources } from "../app";
import { SwitchPathReturn } from "switch-path/lib/commonjs/types";
import { MainComponent } from "./MainComponent";

import { makeAuth0Driver, protect } from "cyclejs-auth0";
import NotFoundComponent from "./NotFoundComponent";
import dropRepeats from "xstream/extra/dropRepeats";
const jwt = require("jwt-decode");
const R = require("ramda");

function routedComponent (sources) {
    return ({path, value}) => value(Object.assign({}, sources, {router: sources.router.path(path)}))
}
// TODO error page zum laufen zu bringen
const routes = {
    '/': protect(MainComponent),
    '/*': NotFoundComponent
}

export function RouterComponent(sources: AppSources): AppSinks {

    const routes$: Stream<SwitchPathReturn> = sources.router.define(routes).compose(dropRepeats((a, b) => a.path == b.path))
    const page$ = routes$.map(routedComponent(sources)).remember()

    return {
        DOM: page$.map(c => c.DOM || xs.never()).flatten(),
        HTTP: page$.map(c => c.HTTP || xs.never()).flatten(),
        router: page$.map(c => c.router || xs.never()).flatten().startWith('/sss'),
        onion: page$.map(c => c.onion || xs.never()).flatten(),
        modal: page$.map(c => c.modal || xs.never()).flatten(),
        auth0: page$.map(c => c.auth0 || xs.never()).flatten()
    };

}
