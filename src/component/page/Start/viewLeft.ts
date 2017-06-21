import { button, div } from "@cycle/dom";
export function viewLeft([state, list]) {

    return [
        (!!state.showNewCardMessage) ? div('.simple.ui.positive.message', [
            div('.ui.grid', [
                div('.two.column.row', [
                    div('.left.floated.column', [div('.header', ['Set "' + state.newCardMessage.title + '" wurde erfolgreich eingefügt'])]),
                    div('.right.floated.column', [button('.route-new-set.ui.green.button.right.floated', ['anzeigen'])])
                ])
            ])

        ]) : null,
        list]

}