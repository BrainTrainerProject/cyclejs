import xs from 'xstream'
import { ProfilePageState } from "./profile-page";
import { IntentSinks } from "./profile-page.intent";
import { ProfileRepository, ProfileRepositoryActions } from "../../../common/repository/ProfileRepository";
import sampleCombine from "xstream/extra/sampleCombine";
import { FollowerRepository, FollowerRepositoryAction } from "../../../common/repository/FollowerRepository";
import dropRepeats from "xstream/extra/dropRepeats";

export function model(sources, intent: IntentSinks) {

    const getProfile$ = sources.onion.state$
        .filter(path => path.user  || path.profile)
        .compose(dropRepeats((oldV, newV) => oldV.ownerId === newV.ownerId))
        .map(path => ProfileRepositoryActions.GetById((path.ownerId) ? path.ownerId : path.user._id))
        .debug('loadProfile');

    const profileRepository = ProfileRepository(sources, getProfile$.remember());

    const followerRepository = FollowerRepository(sources, xs.merge(
        intent.aboClick$
            .compose(sampleCombine(sources.onion.state$))
            .map(([event, state]) => state)
            .filter(state => !state.isOwner)
            .map(state => FollowerRepositoryAction.FollowProfile(state.profile._id)),

        intent.followerListAboClick$
            .map(item => FollowerRepositoryAction.FollowProfile(item._id))
    ));

    const init$ = xs.of((): ProfilePageState => ({
        isPrivate: false,
        isOwner: false,
        ownerId: '',
        profile: null
    }));

    const load$ = intent.loadProfile$
        .map(path => (state) => {
            return {
                ...state,
                ownerId: path.id
            }
        });

    const profileResponses$ = xs.merge(profileRepository.response.getProfileById$);
    const initProfile$ = xs.merge(profileResponses$)
        .map(profile => (state) => ({
            ...state,
            isPrivate: !profile.visibility,
            profile: profile
        }));

    const isOwner$ = sources.onion.state$
        .filter(state => state.user && state.profile)
        .compose(dropRepeats((oldV, newV) => oldV.user._id === newV.user._id))
        .map(s => (state) => ({
            ...state,
            isOwner: state.user._id === state.profile._id,
        }));

    const reducer$ = xs.merge(init$, load$, initProfile$, isOwner$);

    return {
        HTTP: xs.merge(profileRepository.HTTP, followerRepository.HTTP).debug("Profile Request Repo"),
        onion: reducer$
    }

}