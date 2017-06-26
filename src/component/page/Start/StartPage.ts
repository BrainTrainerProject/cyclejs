import { AppSinks, AppSources } from "../../../app";
import { intent } from "./intent";
import { model } from "./model";
import { viewLeft } from "./viewLeft";
import { viewRight } from "./viewRight";
import CardItemList from "../../cards/CardList/CardItemList";
import { GetSetsApi } from "../../../common/api/set/GetSets";
import xs from 'xstream';
import { ModalAction } from "cyclejs-modal";
import { CreateSetFormAction, SetForm } from "../../form/Set/SetForm";
import { button } from "@cycle/dom";
import  isolate  from "@cycle/isolate";
const jwt = require('jwt-decode');

export const ID_NEW_SET_BTN = '.new-set-btn';

export default function StartPage(sources: AppSources): AppSinks {

    const state$ = sources.onion.state$;

    const getSetsSinks = isolate(CardItemList, 'cardlist')(sources, {
        showRating: true,
        showImport: false,
        requestId: GetSetsApi.ID
    });

    const routet$ = getSetsSinks.router;

    const actions = intent(sources);
    const reducer = model(actions);
    const leftDOM$ = getSetsSinks.DOM;
    const rightDOM$ = viewRight(state$);

    const sinks = {
        DOM_LEFT: leftDOM$,
        DOM_RIGHT: rightDOM$,
        HTTP: xs.merge(reducer.HTTP, getSetsSinks.HTTP),
        onion: reducer.onion,
        modal: reducer.modal.debug('MODAL'),
        router: routet$.debug('rote')
    };

    return sinks;

}