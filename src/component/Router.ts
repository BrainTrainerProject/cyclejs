import xs, { Stream } from "xstream";
import { AppSinks, AppSources } from "../app";
import { SwitchPathReturn } from "switch-path/lib/commonjs/types";
import { makeAuth0Driver, protect } from "cyclejs-auth0";
import StartPage from "./page/Start/start-page";
import LoginPage from "./page/Login/LoginPage";
import NotFoundPage from "./page/NotFound/not-found-page";
import { ProtectedPage } from "./page/ProtectedPage";
import { MainLayoutWrapper } from "./layout/MainLayoutWrapper";
import UnderConstructionPage from "./page/UnderConstruction/under-construction-page";
import dropRepeats from "xstream/extra/dropRepeats";
import SetPage from "./page/Set/set-page";
import FeedPage from "./page/Feed/feed-page";
import StorePage from "./page/Store/store-page";
import ProfilePage from './page/Profile/profile-page';
import { PractiseModal } from "../common/Modals";
import { Notifications } from "../common/Notification";
import sampleCombine from "xstream/extra/sampleCombine";
import {PracticePage} from './page/Practice/practice-page';

const routedComponent = (sources) => ({path, value}) => value({...sources, router: sources.router.path(path)});
const protectedPage = (page) => ProtectedPage(page);
const mainLayout = (component) => MainLayoutWrapper(component);
const protectedMainLayout = (Component) => protectedPage(mainLayout(Component));

const routes = {
    '/start': protectedMainLayout(StartPage),
    '/feed': protectedMainLayout(FeedPage),
    '/store': protectedMainLayout(StorePage),
    '/profile': protectedMainLayout(ProfilePage),
    '/set': protectedMainLayout(SetPage),
    '/login': protectedPage(LoginPage),
    '/logout': protectedPage(LoginPage),
    '/practice': protectedPage(PracticePage),
    '*': NotFoundPage,
};

export function Router(sources: AppSources): AppSinks {

    const routes$: Stream<SwitchPathReturn> = sources.router.define(routes).compose(dropRepeats((a, b) => a.path == b.path));
    const page$ = routes$.map(routedComponent(sources)).remember();

    const redirectStartpage$ = sources.router.history$
        .filter(loc => loc.pathname === '/')
        .mapTo('/start');


    return {
        DOM: page$.map(c => c.DOM || xs.never()).flatten(),
        HTTP: page$.map(c => c.HTTP || xs.never()).flatten(),
        router: xs.merge(page$.map(c => c.router || xs.never()).flatten(), redirectStartpage$),
        onion: page$.map(c => c.onion || xs.never()).flatten(),
        modal: page$.map(c => c.modal || xs.never()).flatten(),
        auth0: page$.map(c => c.auth0 || xs.never()).flatten(),
        filter: page$.map(c => c.filter || xs.never()).flatten()
    };

}
