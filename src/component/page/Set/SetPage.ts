import xs, { Stream } from "xstream";
import { br, button, div, form, h3, h5, i, img, p, textarea } from "@cycle/dom";
import { Reducer, Sinks, Sources, State } from "../../../common/interfaces";
import { AppState } from "../../../app";
import { StateSource } from "cycle-onionify";
import { intent } from "./intent";
import { model } from "./model";
import { viewRight } from "./viewRight";
import { viewLeft } from "./viewLeft";
import { GetSetsApi } from "../../../common/api/GetSets";
import CardItemList from "../../cards/CardList/CardItemList";
import Comments from "../../comments/Comments";
import { NestedCardItem } from "../../cards/CardList/NestedCardItem";
import NestedCardItemList from "../../cards/CardList/NestedCardItemList";
const Route = require('route-parser');

export type SetPageSources = Sources & { onion: StateSource<AppState>, filter: any };
export type SetPageSinks = Sinks & { onion: Stream<Reducer>, modal: Stream<any>, filter: Stream<any> };
export interface SetPageState extends State {
    set: {
        id: string,
        title: string,
        description: string,
        image: string,
        notecards: string[]
    },
    rating: {
        comment: string,
        rating: number
    },
    loading: boolean
}

export const ID_NEW_NOTECARD_BTN = '.new-set-btn';
export const ID_RANDOM_NOTECARD_BTN = '.new-set-btn';
export const ID_EDIT_SET_BTN = '.new-set-btn';
export const ID_RATING_BTN = '.new-set-btn';
export const ID_RATING_FORM = '.rating-form';

export default function SetPage(sources) {

    const {router} = sources;

    const state$ = sources.onion.state$;
    const actions = intent(sources);
    const reducer = model(actions);

    const {notecardSinks, commentSinks} = loadOtherComponents(sources, state$);

    const leftDOM$ = xs.combine(state$, notecardSinks.DOM, commentSinks.DOM).map(viewLeft);
    const rightDOM$ = viewRight(state$);

    return {
        DOM_LEFT: leftDOM$,
        DOM_RIGHT: rightDOM$,
        HTTP: xs.merge(reducer.HTTP, notecardSinks.HTTP),
        onion: reducer.onion
    }
}

function loadOtherComponents(sources, state$) {

    const getNotecardsSinks = state$.map(state => {
        return NestedCardItemList(sources, {
            apiCalls: state.set.notecards
        })
    });

    const getCommentsSinks = Comments(sources, {
        setId: '59404bd79eccad225fdd9b8b'
    });

    return {
        notecardSinks: {
            DOM: getNotecardsSinks.map(c => c.DOM || xs.never()).flatten(),
            HTTP: getNotecardsSinks.map(c => c.HTTP || xs.never()).flatten()
        },
        commentSinks: getCommentsSinks
    }

}