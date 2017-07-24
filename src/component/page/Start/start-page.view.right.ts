import { br, button, div } from "@cycle/dom";
import { ID_NEW_SET_BTN, ID_RANDOM_PRACTISE, ID_SET_PRACTISE } from "./start-page";

export function viewRight(state$: any) {

    return state$.map(state => div('.ui', [
        button(ID_NEW_SET_BTN + '.ui.primary.button', ['Set erstellen']),
        br(),
        button(ID_RANDOM_PRACTISE + '.ui.primary.button', ['Set erstellen']),
        br(),
        button(ID_SET_PRACTISE + '.ui.primary.button', ['Set erstellen'])
    ]))

}