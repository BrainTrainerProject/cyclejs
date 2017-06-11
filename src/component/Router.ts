import xs, { Stream } from "xstream";
import { AppSinks, AppSources } from "../app";
import { SwitchPathReturn } from "switch-path/lib/commonjs/types";
import { makeAuth0Driver, protect } from "cyclejs-auth0";
import dropRepeats from "xstream/extra/dropRepeats";
import StartPage from "./page/Start/StartPage";
import LoginPage from "./page/Login/LoginPage";
import NotFoundPage from "./page/NotFound/NotFoundPage";
import SetPage from "./page/Set/SetPage";
import ProfilPage from "./page/Profil/ProfilPage";
import StorePage from "./page/Store/StorePage";
import SettingPage from "./page/Setting/SettingPage";
import FeedPage from "./page/Feed/FeedPage";
import { ProtectedPage } from "./page/ProtectedPage";

function routedComponent(sources) {
    return ({path, value}) =>  value({...sources, router: sources.router.path(path)})
}

const routes = {
    '/start':   protect(StartPage),
    '/feed':    ProtectedPage(FeedPage),
    '/store':   protect(StartPage),
    '/profil':  ProtectedPage(ProfilPage),
    '/set':     ProtectedPage(SetPage),
    '/setting': ProtectedPage(SettingPage),
    '/login':   ProtectedPage(LoginPage),
    '*': NotFoundPage,
};

export function Router(sources: AppSources): AppSinks {

    let startRoute = window.location.pathname;
    if (startRoute === '/') startRoute = '/start';

    const routes$: Stream<SwitchPathReturn> = sources.router.define(routes)//.compose(dropRepeats((a, b) => a.path == b.path));
    const page$ = routes$.map(routedComponent(sources));

    return {
        DOM: page$.map(c => c.DOM || xs.never()).flatten(),
        HTTP: page$.map(c => c.HTTP || xs.never()).flatten(),
        router: page$.map(c => c.router || xs.never()).flatten().startWith(startRoute),
        onion: page$.map(c => c.onion || xs.never()).flatten(),
        modal: page$.map(c => c.modal || xs.never()).flatten(),
        auth0: page$.map(c => c.auth0 || xs.never()).flatten()
    };

}
