import xs from 'xstream'
import { ProfilePageState } from "./profile-page";
import { IntentSinks } from "./profile-page.intent";
import { ProfileRepository, ProfileRepositoryActions } from "../../../common/repository/ProfileRepository";

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

    const init$ = xs.of((): ProfilePageState => ({
        isPrivate: false,
        isOwner: false,
        profile: null
    }));

    const profileResponses$ = xs.merge(profileRepository.response.getOwnProfile$, profileRepository.response.getProfileById$);
    const initProfile$ = xs.merge(profileResponses$)
        .map(profile => (state) => {

            console.log("STATE: ", state);
            console.log("Profile: ", profile);

            return {
                ...state,
                isPrivate: !profile.visibility,
                profile: profile
            }

        });

    const reducer$ = xs.merge(init$, initProfile$);

    return {
        HTTP: profileRepository.HTTP.debug("Profile Request Repo"),
        onion: reducer$
    }

}