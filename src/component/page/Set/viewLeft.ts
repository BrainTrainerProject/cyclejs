import { button, div, form, h3, h5, i, img, p, textarea } from "@cycle/dom";
import { ID_EDIT_SET_BTN, ID_RATING_FORM, SetPageState } from "./SetPage";
export function viewLeft([state, notecards, comments]) {

    const set = (state as SetPageState).set;

    return [


        div(".ui.grid", [

            // Cover
            div(".three.wide.column", [
                div(".ui.one.column.grid", [
                    div(".column", [
                        div(".ui.fluid.card", [
                            div(".image", [
                                img({
                                    "attrs": {
                                        "src": set.image
                                    }
                                })
                            ])
                        ])
                    ])
                ])
            ]),


            // Title
            div(".thirteen.wide.column", {
                "attributes": {
                    "className": "eight wide column"
                },
                "style": {
                    "name": "style",
                    "value": "padding-top: 1.75em"
                }
            }, [

                div(".ui.grid", [

                    // Title
                    div(".eight.wide.column.middle.aligned", [
                        h3(".ui.medium.header", [set.title])
                    ]),

                    // Buttons
                    div(".eight.wide.column", [
                        button(ID_EDIT_SET_BTN + ".ui.icon.button.right.floated", [
                            i(".icon.edit")
                        ])
                    ]),

                    // Beschreibung
                    div(".sixteen.wide.column", [
                        p([set.description])
                    ])

                ])

            ]),

        ]),

        div(".ui.divider"),
        notecards,
        div(".ui.divider"),
        comments
    ]

}