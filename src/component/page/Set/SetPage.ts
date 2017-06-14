import xs from "xstream";
import { br, button, div, form, h5, i, img, p, textarea } from "@cycle/dom";
const Route = require('route-parser');

export default function SetPage(sources) {

    const {router} = sources;

    const route$ = router.history$;

    const getSetId$ = route$
        .map(v => v.pathname)
        .map(path => {
            const route = new Route('/set/:id');
            return route.match(path)
        });


    return {
        DOM_LEFT: xs.of(contentLeft()),
        DOM_RIGHT: xs.of(contentRight()),
        router: getSetId$
    }
}

function contentLeft() {
    return div([

        div(".ui.grid", [div(['Keine Sets vorhanden'])]),

        div(".ui.divider"),

        div(".ui.grid", [
            div(".sixteen.wide.column", [
                form(".ui.form", [
                    h5(".ui.header", [`Bewertung`]),
                    div(".field", [
                        textarea({
                            "attrs": {
                                "placeholder": "Bewertung"
                            }
                        })
                    ]),
                    div(".fields", [
                        div(".four.wide.field", [`rating`]),
                        div(".eight.wide.field.right.floated"),
                        div(".four.wide.field.", [
                            button(".ui.button.right.fluid.floated.", {
                                "attrs": {
                                    "type": "submit",
                                    "className": "ui button right fluid floated "
                                }
                            }, [`bewerten`])
                        ])
                    ])
                ])
            ])
        ]),

        div(".ui.grid", [
            /* Left */,
            div(".sixteen.wide.column", [
                div(".ui.middle.aligned.divided.list", [
                    div(".item", [
                        div(".ui.divider"),
                        div(".right.floated.content", [
                            div(".ui", {
                                "attrs": {
                                    "className": "ui"
                                },
                                "style": {
                                    "name": "style",
                                    "value": "padding: .75em 0 .25em .5em;"
                                }
                            }, [`49min`])
                        ]),
                        div(".ui.horizontal.list", [
                            div(".item", [
                                img(".ui.mini.circular.image", {
                                    "attrs": {
                                        "src": "https://semantic-ui.com/images/avatar2/small/molly.png",
                                        "className": "ui mini circular image"
                                    }
                                }),
                                div(".content", [
                                    div(".ui.sub.header", [`Molly`])
                                ])
                            ]),
                            div(".item", [
                                i(".right.angle.icon.divider")
                            ]),
                            div(".item", [`Rating`])
                        ]),
                        div(".ui.justified.container", {
                            "attrs": {
                                "className": "ui justified container"
                            },
                            "style": {
                                "name": "style",
                                "value": "font-size: 14px !important; padding-top: 15px; !important"
                            }
                        }, [
                            p([`Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa strong. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede link mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra nulla ut metus varius laoreet. Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi.`])
                        ])
                    ])
                ])
            ]),
            div(".sixteen.wide.column", [
                div(".ui.middle.aligned.divided.list", [
                    div(".item", [
                        div(".ui.divider"),
                        div(".right.floated.content", [
                            div(".ui", {
                                "attrs": {
                                    "className": "ui"
                                },
                                "style": {
                                    "name": "style",
                                    "value": "padding: .75em 0 .25em .5em;"
                                }
                            }, [`49min`])
                        ]),
                        div(".ui.horizontal.list", [
                            div(".item", [
                                img(".ui.mini.circular.image", {
                                    "attrs": {
                                        "src": "https://semantic-ui.com/images/avatar2/small/molly.png",
                                        "className": "ui mini circular image"
                                    }
                                }),
                                div(".content", [
                                    div(".ui.sub.header", [`Molly`])
                                ])
                            ]),
                            div(".item", [
                                i(".right.angle.icon.divider")
                            ]),
                            div(".item", [`Rating`])
                        ]),
                        div(".ui.justified.container", {
                            "attrs": {
                                "className": "ui justified container"
                            },
                            "style": {
                                "name": "style",
                                "value": "font-size: 14px !important; padding-top: 15px;"
                            }
                        }, [
                            p([`Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa strong. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede link mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra nulla ut metus varius laoreet. Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi.`])
                        ])
                    ])
                ])
            ])
        ])
    ])
}

function contentRight() {
    return div('.ui', [
        button('.new-set-btn.ui.primary.button', [`Neue Notecard`]),
        br(),
        button('.random-notecard-btn.ui.button', ['Zufällige Notecard'])
    ]);
}