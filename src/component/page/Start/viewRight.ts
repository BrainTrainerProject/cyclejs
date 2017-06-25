import { button, div } from "@cycle/dom";
import { ID_NEW_SET_BTN } from "./StartPage";

export function viewRight(state$: any) {

    return state$.map(state => div('.ui', [
        button(ID_NEW_SET_BTN + '.ui.primary.button', ['Set erstellen'])
    ]))

}