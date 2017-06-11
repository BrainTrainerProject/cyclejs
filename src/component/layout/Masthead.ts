import { a, div, i, img, input, span } from "@cycle/dom";
import xs from 'xstream';

export default function Masthead(sources) {


    return {
        DOM: xs.of(view())
    }

}

function view() {
    return div("#masthead.ui.container", [
        div(".ui.container.content-row-flexible", [
            div(".col-left", [
                div(".ui.secondary..menu", [
                    a(".launch.icon.item.menu-icon", [
                        i(".content.icon")
                    ]),
                    div(".ui.item", [
                        div(".ui.large.breadcrumb", [
                            a(".active.section", [`Start`])
                        ])
                    ]),
                    div(".right.menu.no-space-right", [
                        div(".item", [
                            div("#search.ui.right.aligned.search.input", [
                                div(".ui.icon.input", [
                                    input(".prompt"),
                                    i(".search.link.icon")
                                ]),
                                div(".results")
                            ])
                        ])
                    ])
                ])
            ]),
            div(".col-right.ui.dividing.right.rail", [
                div(".ui.secondary.menu", [
                    div(".right.menu.text.no-space-right", [
                        div(".item", [
                            a(".alarm-icon.item.right.floated", [
                                i(".alarm.outline.icon")
                            ]),
                            div("#user.ui.pointing.dropdown.top.right", {
                                "attrs": {
                                    "tabindex": "0",
                                    "className": "ui pointing dropdown top right"
                                },
                                "id": {
                                    "name": "id",
                                    "value": "user"
                                }
                            }, [
                                div(".text", [
                                    img(".ui.avatar.image", {
                                        "attrs": {
                                            "src": "https://semantic-ui.com/images/avatar/large/elliot.jpg",
                                            "alt": "",
                                            "className": "ui avatar image"
                                        }
                                    })
                                ]),
                                div(".menu", {
                                    "attrs": {
                                        "tabindex": "-1",
                                        "className": "menu"
                                    }
                                }, [
                                    div(".item", [`Profil`]),
                                    div(".item", [`Einstellungen`]),
                                    div(".item", [`Logout`])
                                ])
                            ])
                        ])
                    ])
                ])
            ])
        ]),
        div(".ui.container.content-row", [
            div(".ui.secondary..menu", [
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
            ]),
            div(".ui.divider")
        ])
    ])

}