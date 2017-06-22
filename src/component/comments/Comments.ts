import { Reducer, Sinks, Sources, State } from "../../common/interfaces";
import { StateSource } from "cycle-onionify";
import { AppState } from "../../app";
import xs, { Stream } from "xstream";
import { button, div, form, h5, i, img, p, textarea } from "@cycle/dom";
import { ID_RATING_FORM } from "../page/Set/SetPage";


export type CommentsSources = Sources & {};
export type CommentsSinks = Sinks & { onion: Stream<Reducer> };
export interface CommentsState extends State {

}

export interface CommentsProps {
    setId: string
}

export default function Comments(sources: CommentsSources, props: CommentsProps) {

    const {router} = sources;

    return {
        DOM: xs.of(view())
    }
}

function view() {

    return div([
        // FORM
        div(".ui.grid", [
            div(".sixteen.wide.column", [
                form(".ui.form", [
                    h5(".ui.header", [`Bewertung`]),
                    div(".field", [
                        textarea(ID_RATING_FORM, {
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

        // COMMENTS LIST
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