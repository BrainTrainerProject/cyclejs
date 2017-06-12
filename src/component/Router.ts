import xs, { Stream } from "xstream";
import { AppSinks, AppSources } from "../app";
import { SwitchPathReturn } from "switch-path/lib/commonjs/types";
import { makeAuth0Driver, protect } from "cyclejs-auth0";
import StartPage from "./page/Start/StartPage";
import LoginPage from "./page/Login/LoginPage";
import NotFoundPage from "./page/NotFound/NotFoundPage";
import { ProtectedPage } from "./page/ProtectedPage";
import { MainLayoutWrapper } from "./layout/MainLayoutWrapper";
import UnderConstructionPage from "./page/UnderConstruction/UnderConstructionPage";
import dropRepeats from "xstream/extra/dropRepeats";

function routedComponent(sources) {
    return ({path, value}) => value({...sources, router: sources.router.path(path)})
}

const routes = {
    '/start': protect(StartPage),
    '/feed': ProtectedPage(MainLayoutWrapper(UnderConstructionPage)),
    '/store': ProtectedPage(MainLayoutWrapper(UnderConstructionPage)),
    '/profile': ProtectedPage(MainLayoutWrapper(UnderConstructionPage)),
    '/sets': ProtectedPage(MainLayoutWrapper(UnderConstructionPage)),
    '/settings': ProtectedPage(MainLayoutWrapper(UnderConstructionPage)),
    '/login': ProtectedPage(LoginPage),
    '/logout': ProtectedPage(MainLayoutWrapper(UnderConstructionPage)),
    '*': NotFoundPage,
};

export function Router(sources: AppSources): AppSinks {

    const routes$: Stream<SwitchPathReturn> = sources.router.define(routes).compose(dropRepeats((a, b) => a.path == b.path));
    const page$ = routes$.map(routedComponent(sources)).remember();

    const redirectHomepage$ = sources.router.history$
        .filter(loc => loc.pathname === '/')
        .mapTo('/start');

    return {
        DOM: page$.map(c => c.DOM || xs.never()).flatten(),
        HTTP: page$.map(c => c.HTTP || xs.never()).flatten(),
        router: xs.merge(page$.map(c => c.router || xs.never()).flatten(), redirectHomepage$),
        onion: page$.map(c => c.onion || xs.never()).flatten(),
        modal: page$.map(c => c.modal || xs.never()).flatten(),
        auth0: page$.map(c => c.auth0 || xs.never()).flatten()
    };

}
