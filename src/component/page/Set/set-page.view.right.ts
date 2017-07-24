import { br, button, div } from '@cycle/dom';
import { ID_NEW_NOTECARD_BTN, ID_RANDOM_NOTECARD_BTN } from './set-page';

export function viewRight(state$: any) {

    return state$.map(state => div('.ui', [
        button(ID_NEW_NOTECARD_BTN + '.ui.primary.button', [`Notecard erstellen`]),
        br(),
        button(ID_RANDOM_NOTECARD_BTN + '.ui.button', ['Zufällige Notecard'])
    ]));

}