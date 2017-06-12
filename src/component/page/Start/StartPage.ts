import xs from "xstream";
import { a, button, div, i, img, input, pre, span } from "@cycle/dom";
import NotecardForm from "../../form/NotecardForm/index";
import { VNode } from "snabbdom/vnode";
import { ModalAction } from "cyclejs-modal";
import { AppSinks, AppSources } from "../../../app";
import { Sidebar } from "../../layout/Sidebar";
import CardView from "../../CardView/index";
const jwt = require("jwt-decode");

export default function StartPage(sources: AppSources): AppSinks {

    const actions = intent(sources);
    const reducer = model(actions);

    // Cards
    const lessonsSinks = CardView(sources);

    const leftView$ = lessonsSinks.DOM;
    const rightView$ = xs.of(contentRight());

    //const mainLayoutSinks = MainLayout(sources)(leftView$, rightView$);

    const sinks = {
        DOM_LEFT: leftView$,
        DOM_RIGHT: rightView$,
        HTTP: lessonsSinks.HTTP,
        modal: reducer.modal,
        onion: lessonsSinks.onion
    };

    return sinks;
}

function intent(sources: AppSources) {

    const {DOM} = sources;

    return {
        newSetClick$: DOM.select('.new-set-btn').events('click')
    };
}

function model(actions) {

    const openNotecardModal$ = actions.newSetClick$.mapTo({
        type: 'open',
        props: {
            title: 'Neues Set erstellen'
        },
        component: NotecardForm
    } as ModalAction);

    const $modal = openNotecardModal$;

    const sinks = {
        modal: $modal
    };
    return sinks;
}

function contentRight() {
    return div('.ui', [
        button('.new-set-btn.ui.primary.button', [`Neues Set erstellen`])
    ]);
}