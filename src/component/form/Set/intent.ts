import {BTN_SUBMIT, INP_DESC, INP_TAGS, INP_TITLE, INP_VISBILITY} from './view';
import {DOMSource} from '@cycle/dom';

export function intent(sources): any {

    const DOM: DOMSource = sources.DOM;

    const inputEvents = (selector) => DOM.select(selector).events('input').map(ev => (ev.target as HTMLInputElement).value);
    const clickEvents = (selector) => DOM.select(selector).events('click').map(ev => {
        ev.preventDefault();
        return ev;
    });

    return {
        submit$: clickEvents(BTN_SUBMIT),
        inputTitle$: inputEvents(INP_TITLE),
        inputDescription$: inputEvents(INP_DESC),
        inputTags$: inputEvents(INP_TAGS),
        selectVisibility$: DOM.select(INP_VISBILITY).events('change')
    };
}