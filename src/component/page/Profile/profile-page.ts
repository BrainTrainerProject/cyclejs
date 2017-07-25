import xs from 'xstream';
import { view } from './profile-page.view';
import { State } from "../../../common/interfaces";
import { intent } from "./profile-page.intent";
import { model } from "./profile-page.model";
import { FeedList, FeedListAction } from "../../lists/FeedList";
import isolate from "@cycle/isolate";
import dropRepeats from "xstream/extra/dropRepeats";
import SetListComponent, { SetListAction } from "../../lists/sets/SetList";
import { FollowerList, FollowerListAction } from "../../lists/FollowerList";
import { div } from "@cycle/dom";

export const ID_FOLLOWER_BTN = '.profile-follower';

export interface ProfilePageState extends State {
    isPrivate: boolean,
    isOwner: boolean,
    ownerId: string,
    profile: object,
}

export default function ProfilePage(sources) {

    const state$ = sources.onion.state$.debug('ProfilePage State$');

    const aboProxy$ = xs.create();
    const action = intent(sources, aboProxy$);
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

    // Sets
    const sets$ = isolate(SetListComponent, 'sets')(sources,
        profileId$.map(id => SetListAction.GetSetsByProfileId(id)));

    const setRoute$ = sets$.itemClick$
        .map(item => '/set/' + item._id);

    // Follower
    const follower$ = isolate(FollowerList, 'follower')(sources,
        profileId$.map(id => FollowerListAction.GetByUserId(id)));

    aboProxy$.imitate(follower$.aboClick$);
    const followerRoute$ = follower$.profileClick$
        .map(item => '/profile/' + item._id);

    const sinks = {
        DOM_LEFT: view(state$, feed$.DOM, sets$.DOM, follower$.DOM),
        DOM_RIGHT: xs.of([]),
        onion: xs.merge(reducer.onion, feed$.onion, sets$.onion, follower$.onion),
        HTTP: xs.merge(reducer.HTTP, feed$.HTTP, sets$.HTTP, follower$.HTTP),
        router: xs.merge(setRoute$, followerRoute$)
    };

    return sinks;

}