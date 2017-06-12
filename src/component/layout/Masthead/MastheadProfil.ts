import { a, div, i, img } from "@cycle/dom";
import xs from "xstream";

export default function MastheadProfil(sources) {

    const feedClick$ = sources.DOM.select('.alarm-icon').events('click').mapTo('/feed')
    const profileClick$ = sources.DOM.select('.nav-profile').events('click').mapTo('/profile');
    const settingsClick$ = sources.DOM.select('.nav-settings').events('click').mapTo('/settings');
    const logoutClick$ = sources.DOM.select('.nav-logout').events('click').mapTo('/logout');

    const route$ = xs.merge(profileClick$, settingsClick$, logoutClick$, feedClick$);

    return {
        DOM: xs.of(view()),
        router: route$
    }

}

function view() {
    return div(".col-right.ui.dividing.right.rail", [
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
                                    "src": "https://semantic-ui.com/images/avatar/large/elliot.jpg",
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
}