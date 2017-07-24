import { br, button, div } from "@cycle/dom";
import {
    ID_NEW_SET_BTN, ID_PRACTISE_AMOUNT, ID_PRACTISE, ID_SET_PRACTISE,
    ID_SET_PRACTISE_AMOUNT, ID_SHOW
} from "./start-page";

export function viewRight(state$: any) {

    return state$.map(state => div('.ui', [
        button(ID_NEW_SET_BTN + '.ui.primary.button', ['Set erstellen']),
        br(),
        button(ID_PRACTISE + '.ui.primary.button', ['Practise']),
        br(),
        button(ID_SET_PRACTISE + '.ui.primary.button', ['Set Practise']),
        br(),
        button(ID_PRACTISE_AMOUNT + '.ui.primary.button', ['Practise Amount']),
        br(),
        button(ID_SET_PRACTISE_AMOUNT + '.ui.primary.button', ['Set Practise Amount']),
        br(),
        button(ID_SHOW + '.ui.primary.button', ['Show']),
    ]))

}