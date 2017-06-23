import {Stream} from 'xstream';
import {assoc, assocPath, dissocPath} from 'ramda';
import {Reducer} from './interfaces';
import {isNullOrUndefined} from 'util';
import {Utils} from './Utils';
import {div, li, ul} from '@cycle/dom';
import {VNode} from 'snabbdom/vnode';
const R = require('ramda');


export function inputErrorState(selectorKey, msg, prevState) {
    return assocPath(['errors', selectorKey, 'msg'], msg, prevState);
}

export function inputStream(selectorKey, valueKey, input$): Stream<Reducer> {
    return input$.map(value => function reducer(state) {
        state = dissocPath(['errors', selectorKey], state);
        state = assoc(valueKey, value, state);
        return state;
    });
}

export interface ErrorMessageState {
    errors: [{ msg: string }];
}

export function errorMessage(state: ErrorMessageState): VNode {
    if (!isNullOrUndefined(state.errors) && Utils.jsonHasChilds(state.errors)) {
        return div('.ui.error.message', [
            ul('.list', R.values(R.map(error => li([error.msg]), state.errors))
            )
        ]);
    } else {
        return undefined;
    }
}

