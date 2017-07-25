import {AppSources} from '../../../app';
import {intent} from './start-page.intent';
import {model} from './start-page.model';
import {viewRight} from './start-page.view.right';
import xs from 'xstream';
import {PractiseFormActions} from '../../form/Practise/practise-form.actions';
import {PractiseForm} from '../../form/Practise/practise-form';
import {div} from '@cycle/dom';

export const ID_NEW_SET_BTN = '.new-set-btn';
export const ID_PRACTISE = '.random-practice';
export const ID_SET_PRACTISE = '.practise-practise';
export const ID_SET_PRACTISE_AMOUNT = '.practise-practisesaa';
export const ID_PRACTISE_AMOUNT = '.practise-practisef';
export const ID_SHOW = '.practise-practiseasdasdf';

export function PracticePage(sources: AppSources): any {

    const state$ = sources.onion.state$;
    const notecardForm$ = PractiseForm(sources, xs.of(PractiseFormActions.Practise()));

    return {
        DOM: view(notecardForm$),
        HTTP: notecardForm$.HTTP,
        onion: notecardForm$.onion
    };

}

function view(practiseForm$) {
    return practiseForm$.DOM.map(form => div('.container', {attrs: {style: 'width: 100%;'}}, div('.content',[form])));
}