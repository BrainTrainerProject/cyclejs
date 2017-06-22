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
import SetPage from "./page/Set/SetPage";
import FeedPage from "./page/Feed/FeedPage";

const routedComponent = (sources) => ({path, value}) => value({...sources, router: sources.router.path(path)});
const protectedPage = (page) => ProtectedPage(page);
const mainLayout = (component) => MainLayoutWrapper(component);
const protectedMainLayout = (Component) => protectedPage(mainLayout(Component));

const routes = {
    '/start': protectedMainLayout(StartPage),
    '/feed': protectedMainLayout(FeedPage),
    '/store': protectedMainLayout(UnderConstructionPage),
    '/profile': protectedMainLayout(UnderConstructionPage),
    '/settings': protectedMainLayout(UnderConstructionPage),
    '/set': protectedMainLayout(SetPage),
    '/login': protectedPage(LoginPage),
    '/logout': protectedPage(LoginPage),
    '*': NotFoundPage,
};

export function Router(sources: AppSources): AppSinks {

    const routes$: Stream<SwitchPathReturn> = sources.router.define(routes).compose(dropRepeats((a, b) => a.path == b.path));
    const page$ = routes$.map(routedComponent(sources)).remember();

    const redirectStartpage$ = sources.router.history$
        .filter(loc => loc.pathname === '/')
        .mapTo('/start');

    return {
        DOM: page$.map(c => c.DOM || xs.empty()).flatten(),
        HTTP: page$.map(c => c.HTTP || xs.empty()).flatten(),
        router: xs.merge(page$.map(c => c.router || xs.empty()).flatten(), redirectStartpage$),
        onion: page$.map(c => c.onion || xs.empty()).flatten(),
        modal: page$.map(c => c.modal || xs.empty()).flatten(),
        auth0: page$.map(c => c.auth0 || xs.empty()).flatten(),
        filter: page$.map(c => c.filter || xs.empty()).flatten()
    };

}
