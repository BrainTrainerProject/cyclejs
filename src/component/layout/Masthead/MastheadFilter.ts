import { a, div, i, img, span } from "@cycle/dom";
import xs from "xstream";

export default function MastheadFilter(sources) {

    const profileClick$ = sources.DOM.select('.nav-profil').events('click').mapTo('/profil');
    const settingClick$ = sources.DOM.select('.nav-setting').events('click').mapTo('/setting');
    const logoutClick$ = sources.DOM.select('.nav-logout').events('click').mapTo('/logout');

    const route$ = xs.merge(profileClick$, settingClick$, logoutClick$);

    return {
        DOM: xs.of(view()),
        router: route$
    }

}

function view() {
    return div(".ui.secondary..menu", [
        div(".ui.item", [
            div(".ui.dropdown.simple", [
                div(".text", [`File`]),
                i(".dropdown.icon"),
                div(".menu", [
                    div(".item", [`New`]),
                    div(".item", [
                        span(".description", [`ctrl + o`]),
                        `
     Open...`
                    ]),
                    div(".item", [
                        span(".description", [`ctrl + s`]),
                        `
     Save as...`
                    ]),
                    div(".item", [
                        span(".description", [`ctrl + r`]),
                        `
     Rename`
                    ]),
                    div(".item", [`Make a copy`]),
                    div(".item", [
                        i(".folder.icon"),
                        `
     Move to folder`
                    ]),
                    div(".item", [
                        i(".trash.icon"),
                        `
     Move to trash`
                    ]),
                    div(".divider"),
                    div(".item", [`Download As...`]),
                    div(".item", [
                        i(".dropdown.icon"),
                        `
     Publish To Web`,
                        div(".menu", [
                            div(".item", [`Google Docs`]),
                            div(".item", [`Google Drive`]),
                            div(".item", [`Dropbox`]),
                            div(".item", [`Adobe Creative Cloud`]),
                            div(".item", [`Private FTP`]),
                            div(".item", [`Another Service...`])
                        ])
                    ]),
                    div(".item", [`E-mail Collaborators`])
                ])
            ])
        ]),
        div(".right.menu", [
            div(".item", [
                div(".ui.dropdown", [
                    div(".text", [`File`]),
                    i(".dropdown.icon"),
                    div(".menu", [
                        div(".item", [`New`]),
                        div(".item", [
                            span(".description", [`ctrl + o`]),
                            `
     Open...`
                        ]),
                        div(".item", [
                            span(".description", [`ctrl + s`]),
                            `
     Save as...`
                        ]),
                        div(".item", [
                            span(".description", [`ctrl + r`]),
                            `
     Rename`
                        ]),
                        div(".item", [`Make a copy`]),
                        div(".item", [
                            i(".folder.icon"),
                            `
     Move to folder`
                        ]),
                        div(".item", [
                            i(".trash.icon"),
                            `
     Move to trash`
                        ]),
                        div(".divider"),
                        div(".item", [`Download As...`]),
                        div(".item", [
                            i(".dropdown.icon"),
                            `
     Publish To Web`,
                            div(".menu", [
                                div(".item", [`Google Docs`]),
                                div(".item", [`Google Drive`]),
                                div(".item", [`Dropbox`]),
                                div(".item", [`Adobe Creative Cloud`]),
                                div(".item", [`Private FTP`]),
                                div(".item", [`Another Service...`])
                            ])
                        ]),
                        div(".item", [`E-mail Collaborators`])
                    ])
                ])
            ])
        ])
    ])
}