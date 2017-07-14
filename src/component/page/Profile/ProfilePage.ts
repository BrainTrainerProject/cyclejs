import xs from 'xstream';
import {div} from '@cycle/dom';
import {view} from './view';

export default function ProfilePage(sources) {

    const sinks = {
        DOM_LEFT: xs.of(view()),
        DOM_RIGHT: xs.of([]),
    };

    return sinks;

}