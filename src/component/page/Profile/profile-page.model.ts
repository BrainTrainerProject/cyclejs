import xs from 'xstream'
import { ProfilePageState } from "./profile-page";
import { IntentSinks } from "./profile-page.intent";
import { ProfileRepository, ProfileRepositoryActions } from "../../../common/repository/ProfileRepository";
import sampleCombine from "xstream/extra/sampleCombine";
import { FollowerRepository, FollowerRepositoryAction } from "../../../common/repository/FollowerRepository";

export function model(sources, intent: IntentSinks) {

    const profileRepository = ProfileRepository(sources, intent.loadProfile$
        .map(path => {
            if (path.id) {
                console.log('Profile: ByID');
                return ProfileRepositoryActions.GetOwn()
            } else {
                console.log('Profile: Own');
                return ProfileRepositoryActions.GetOwn()
            }
        }).remember());

    const followerRepository = FollowerRepository(sources, xs.merge(
        intent.aboClick$
            .compose(sampleCombine(sources.onion.state$))
            .map(([event, state]) => state)
            .filter(state => !state.isOwner)
            .map(state => FollowerRepositoryAction.FollowProfile(state.profile._id))
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

    const profileResponses$ = xs.merge(profileRepository.response.getOwnProfile$, profileRepository.response.getProfileById$);
    const initProfile$ = xs.merge(profileResponses$)
        .map(profile => (state) => {

            console.log("STATE: ", state);
            console.log("Profile: ", profile);

            return {
                ...state,
                isPrivate: !profile.visibility,
                isOwner: (!state.ownerId) || (profile._id === state.ownerId),
                profile: profile
            }

        });

    const reducer$ = xs.merge(init$, load$, initProfile$);

    return {
        HTTP: xs.merge(profileRepository.HTTP, followerRepository.HTTP).debug("Profile Request Repo"),
        onion: reducer$
    }

}