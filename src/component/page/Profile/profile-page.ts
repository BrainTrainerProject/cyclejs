import xs from 'xstream';
import { view } from './profile-page.view';
import { State } from "../../../common/interfaces";
import { intent } from "./profile-page.intent";
import { model } from "./profile-page.model";
import { FeedList, FeedListAction } from "../../lists/FeedList";
import isolate from "@cycle/isolate";
import dropRepeats from "xstream/extra/dropRepeats";
import SetListComponent, { SetListAction } from "../../lists/sets/SetList";

export interface ProfilePageState extends State {
    isPrivate: boolean,
    isOwner: boolean,
    profile: object,
}

export default function ProfilePage(sources) {

    const state$ = sources.onion.state$.debug('ProfilePage State$');

    const action = intent(sources);
    const reducer = model(sources, action);

    // Filter Profile id
    const profileId$ = state$
        .filter(state => state.profile)
        .filter(state => !!state.profile._id)
        .filter(state => !state.isPrivate)
        .compose(dropRepeats((oldS, newS) => oldS.profile._id === newS.profile._id))
        .map(state => state.profile._id);

    // Feed
    const feed$ = isolate(FeedList, 'feed')(sources,
        profileId$.map(id => FeedListAction.GetById(id)));

    const sets$ = isolate(SetListComponent, 'sets')(sources,
        profileId$.map(id => SetListAction.GetSetsByProfileId(id)));

    const setRoute$ = sets$.itemClick$
        .map(item => '/set/' + item._id);

    const sinks = {
        DOM_LEFT: view(state$, feed$.DOM, sets$.DOM),
        DOM_RIGHT: xs.of([]),
        onion: xs.merge(reducer.onion, feed$.onion, sets$.onion),
        HTTP: xs.merge(reducer.HTTP, feed$.HTTP, sets$.HTTP),
        router: setRoute$
    };

    return sinks;

}