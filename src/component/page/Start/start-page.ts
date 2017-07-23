import { AppSinks, AppSources } from "../../../app";
import { intent } from "./start-page.intent";
import { model } from "./start-page.model";
import { viewRight } from "./start-page.view.right";
import xs from 'xstream';
import isolate from "@cycle/isolate";
import SetListComponent, { SetListAction } from "../../lists/sets/SetList";

export const ID_NEW_SET_BTN = '.new-set-btn';

export default function StartPage(sources: AppSources): any {

    const state$ = sources.onion.state$;
    const setsComponentSinks = isolate(SetListComponent, 'setListComponent')(sources, xs.of(SetListAction.GetOwnSets()));

    const actions = intent(sources);
    const reducer = model(actions);
    const leftDOM$ = setsComponentSinks.DOM;
    const rightDOM$ = viewRight(state$);

    return {
        DOM_LEFT: leftDOM$,
        DOM_RIGHT: rightDOM$,
        HTTP: xs.merge(setsComponentSinks.HTTP),
        onion: xs.merge(reducer.onion, setsComponentSinks.onion),
        modal: reducer.modal,
        router: setsComponentSinks.itemClick$.map(item => '/set/' + item._id)
    };

}