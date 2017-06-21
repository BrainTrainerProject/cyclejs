import { AppSinks, AppSources } from "../../../app";
import { intent } from "./intent";
import { model } from "./model";
import { viewLeft } from "./viewLeft";
import { viewRight } from "./viewRight";
import CardItemList from "../../cards/CardList/CardItemList";
import { GetSetsApi } from "../../../common/api/GetSets";
import xs from 'xstream';
const jwt = require('jwt-decode');

export const ID_NEW_SET_BTN = '.new-set-btn';

export default function StartPage(sources: AppSources): AppSinks {

    const state$ = sources.onion.state$

    const getSetsSinks = CardItemList(sources, {
        showRating: true,
        showImport: false,
        requestId: GetSetsApi.ID
    });

    const actions = intent(sources);
    const reducer = model(actions);
    const leftDOM$ = xs.combine(state$, getSetsSinks.DOM).map(viewLeft);
    const rightDOM$ = viewRight(state$);

    const sinks = {
        DOM_LEFT: leftDOM$,
        DOM_RIGHT: rightDOM$,
        HTTP: reducer.HTTP,
        onion: reducer.onion,
        modal: reducer.modal.debug('MODAL')
    };

    return sinks;

}