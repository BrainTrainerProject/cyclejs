import { button, div } from "@cycle/dom";
import { ID_NEW_SET_BTN } from "./start-page";

export function viewRight(state$: any) {

    return state$.map(state => div('.ui', [
        button(ID_NEW_SET_BTN + '.ui.primary.button', ['Set erstellen'])
    ]))

}