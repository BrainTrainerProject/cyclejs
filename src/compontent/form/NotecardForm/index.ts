import {Stream} from 'xstream';
import {StateSource} from 'cycle-onionify';
import {Reducer, Sinks, Sources, State} from '../../../interfaces';
import {intent} from './intent';
import {model} from './model';
import {view} from './view';

export type NotecardFormSources = Sources & { onion: StateSource<NotecardFormState> };
export type NotecardFormSinks = Sinks & { onion: Stream<Reducer> };
export interface NotecardFormState extends State {
    type: NotecardFormSubmitType,
    title: String,
    description: String,
    tags: String,
    visbility: NotecardVisibiblityType,
    submit: boolean
}

export const BTN_SUBMIT = '.btn_submit';
export const INP_TITLE = '.inp_title';
export const INP_DESC = '.inp_desc';
export const INP_TAGS = '.inp_tags';
export const INP_VISBILITY = '.inp_tags';

export enum NotecardFormSubmitType{
    ADD, EDIT, DELETE
}

export enum NotecardVisibiblityType{
    PRIVATE, PUBLIC
}

function NotecardForm(sources: NotecardFormSources): NotecardFormSinks {

    const state$ = sources.onion.state$;
    const action$ = intent(sources.DOM);
    const reducer$ = model(sources.HTTP, action$);

    const vdom$ = view(state$);
    const sinks = {
        DOM: vdom$,
        HTTP: reducer$.HTTP,
        onion: reducer$.onion
    };
    return sinks;
}

export default NotecardForm;