import { AppSources } from "../../../app";
import { intent } from "./start-page.intent";
import { model } from "./start-page.model";
import { viewRight } from "./start-page.view.right";
import xs from 'xstream';
import isolate from "@cycle/isolate";
import SetListComponent, { SetListAction } from "../../lists/sets/SetList";
import { PractiseFormActions } from "../../form/Practise/practise-form.actions";
import { PractiseRepositoryActions } from "../../../common/repository/PractiseRepository";
import { PractiseModal } from "../../../common/Modals";

export const ID_NEW_SET_BTN = '.new-set-btn';
export const ID_PRACTISE = '.random-practice';
export const ID_SET_PRACTISE = '.practise-practise';
export const ID_SET_PRACTISE_AMOUNT = '.practise-practisesaa';
export const ID_PRACTISE_AMOUNT = '.practise-practisef';
export const ID_SHOW = '.practise-practiseasdasdf';

export default function StartPage(sources: AppSources): any {

    const state$ = sources.onion.state$;
    const setsComponentSinks = isolate(SetListComponent, 'setListComponent')(sources, xs.of(SetListAction.GetOwnSets()));

    const actions = intent(sources);
    const reducer = model(actions);
    const leftDOM$ = setsComponentSinks.DOM;
    const rightDOM$ = viewRight(state$);

    // TEMP
    const practiseClick$ = sources.DOM.select(ID_PRACTISE).events('click');
    const practiseAmountClick$ = sources.DOM.select(ID_PRACTISE_AMOUNT).events('click');
    const setPractiseClick$ = sources.DOM.select(ID_SET_PRACTISE).events('click');
    const setPractiseAmountClick$ = sources.DOM.select(ID_SET_PRACTISE_AMOUNT).events('click');
    const showClick$ = sources.DOM.select(ID_SHOW).events('click');

    const practise$ = practiseClick$
        .mapTo(PractiseModal.Practise());

    const practiseBySet$ = setPractiseClick$
        .mapTo(PractiseModal.PractiseBySet('5975b4cbdcea1a0db09f6841'));

    const practiseAmount$ = practiseAmountClick$
        .mapTo(PractiseModal.PractiseAmount(1));

    const practiseBySetAmount$ = setPractiseAmountClick$
        .mapTo(PractiseModal.PractiseBySetAmount('5975b4cbdcea1a0db09f6841', 1));

    const show$ = showClick$.mapTo(PractiseModal.ShowNotecard('5975ea00dcea1a0db09f6847'));

    const modal$ = xs.merge(practise$, practiseBySet$, practiseAmount$, practiseBySetAmount$, show$);
    // TEMP

    return {
        DOM_LEFT: leftDOM$,
        DOM_RIGHT: rightDOM$,
        HTTP: xs.merge(setsComponentSinks.HTTP),
        onion: xs.merge(reducer.onion, setsComponentSinks.onion),
        modal: xs.merge(reducer.modal, modal$).debug('modals'),
        router: setsComponentSinks.itemClick$.map(item => '/set/' + item._id)
    };

}