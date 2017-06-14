import xs from "xstream";
import { button, div } from "@cycle/dom";
import NotecardForm from "../../form/NotecardForm/index";
import { ModalAction } from "cyclejs-modal";
import { AppSinks, AppSources } from "../../../app";
import CardItemList from "../../cards/CardList/CardItemList";
import { GetSetsApi } from "../../../common/api/GetSets";
const jwt = require("jwt-decode");

export default function StartPage(sources: AppSources): AppSinks {

    const actions = intent(sources);
    const reducer = model(actions);

    const refreshList$ = xs.of(GetSetsApi.buildRequest());

    // Cards
    const lessonsSinks = CardItemList(sources, {
        showRating:true,
        showImport:true,
        requestId: GetSetsApi.ID
    });

    const leftView$ = lessonsSinks.DOM;
    const rightView$ = xs.of(contentRight());

    const sinks = {
        DOM_LEFT: leftView$,
        DOM_RIGHT: rightView$,
        HTTP: xs.merge(lessonsSinks.HTTP || xs.empty(), refreshList$),
        modal: reducer.modal,
        onion: lessonsSinks.onion,
        router: lessonsSinks.router.debug('router')
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