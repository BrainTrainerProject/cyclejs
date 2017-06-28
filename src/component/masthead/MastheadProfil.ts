import { a, div, i, img } from "@cycle/dom";
import xs from "xstream";
import { ModalAction } from "cyclejs-modal";
import SettingsForm from "../form/Settings/Settings";
import { GetProfileApi } from "../../common/api/profile/GetProfile";
import { Utils } from "../../common/Utils";

export default function MastheadProfil(sources) {

    const state$ = sources.onion.state$.debug("PROFILE STATE");

    const feedClick$ = sources.DOM.select('.alarm-icon').events('click').mapTo('/feed');
    const profileClick$ = sources.DOM.select('.nav-profile').events('click').mapTo('/profile');
    const settingsClick$ = sources.DOM.select('.nav-settings').events('click');
    const logoutClick$ = sources.DOM.select('.nav-logout').events('click').mapTo('/logout');

    const route$ = xs.merge(profileClick$, logoutClick$, feedClick$);

    const requestUserProfile$ = xs.of(GetProfileApi.buildRequest({id: ''}));
    const responseUserProfile$ = sources.HTTP.select(GetProfileApi.ID)
        .flatten()
        .map(({text}) => JSON.parse(text));

    const profileReducer$ = responseUserProfile$
        .map(profile => (state) => ({
            image: profile.photourl
        }));

    const openSettingsModal$ = settingsClick$
        .mapTo({
            type: 'open',
            props: {
                title: 'Einstellungen',
            },
            component: SettingsForm
        } as ModalAction);

    return {
        DOM: view(state$),
        router: route$,
        modal: openSettingsModal$,
        HTTP: requestUserProfile$,
        onion: profileReducer$
    }

}

function view(state$) {
    return state$.map(state => div(".col-right.ui.dividing.right.rail", [
            div(".ui.secondary.menu", [
                div(".right.menu.text.no-space-right", [
                    div(".item", [
                        a(".alarm-icon.item.right.floated", [
                            i(".alarm.outline.icon")
                        ]),

                        div("#user.ui.pointing.dropdown.link.top.right", {
                            hook: {
                                insert: (vnode) => {
                                    $(vnode.elm).dropdown({});
                                }
                            }
                        }, [
                            div(".item", [
                                img(".ui.avatar.image", {
                                    "attrs": {
                                        "src": Utils.imageOrPlaceHolder(state.image),
                                    }
                                })
                            ]),
                            div(".menu", {
                                props: {
                                    style: 'right: 16px !important;'
                                }
                            }, [
                                div(".nav-profile.item", [`Profile`]),
                                div(".nav-settings.item", [`Einstellungen`]),
                                div(".nav-logout.item", [`Logout`])
                            ])
                        ])
                    ])
                ])
            ])
        ])
    )
}