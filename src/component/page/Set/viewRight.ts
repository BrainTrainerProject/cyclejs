import { br, button, div } from "@cycle/dom";
import { ID_NEW_NOTECARD_BTN, ID_RANDOM_NOTECARD_BTN } from "./SetPage";

export function viewRight(state$: any) {

    return state$.map(state => div('.ui', [
        button(ID_NEW_NOTECARD_BTN + '.ui.primary.button', [`Neue Notecard`]),
        br(),
        button(ID_RANDOM_NOTECARD_BTN + '.ui.button', ['Zufällige Notecard'])
    ]))

}