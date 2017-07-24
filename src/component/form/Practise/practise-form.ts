import xs, { Stream } from "xstream";
import { StateSource } from "cycle-onionify";
import { Reducer, Sinks, Sources, State } from "../../../common/interfaces";
import { isNullOrUndefined } from "util";
import { PractiseFormAction } from "./practise-form.actions";
import { view } from "./practise-form.view";
import { intent } from "./practise-form.intent";
import { model } from "./practise-form.model";
import dropRepeats from "xstream/extra/dropRepeats";
import debounce from "xstream/extra/debounce";

export type PractiseFormSources = Sources & { onion: StateSource<PractiseFormState> };
export type PractiseFromSinks = Sinks & { onion: Stream<Reducer> };

export enum Mode {
    PRACTICE, SKIP, RESULT
}

export interface PractiseFormState extends State {
    mode: Mode,
    practiceIndex: number,
    practices: NotecardEntity[],
    result: { notecard: string, success: boolean }[],
    showResult: boolean,
    answer: string,
    finish: boolean,
    isLast: boolean
}

export function PractiseForm(sources: PractiseFormSources, action$?: Stream<PractiseFormAction>): PractiseFromSinks {

    const state$ = sources.onion.state$.debug('Practise Form State');
    const actions = intent(sources, combineActions(sources, action$));
    const reducer = model(sources, actions, state$);

    return {
        DOM: view(state$),
        onion: reducer.onion,
        HTTP: reducer.HTTP,
        modal: reducer.modal
    };

}

function combineActions(sources: PractiseFormSources, action$?: Stream<PractiseFormAction>): Stream<PractiseFormAction> {

    const propsAction$ = xs.of(sources.props.action)
        .filter(action => !!action);

    const directAction$ = xs.of(action$)
        .filter(action => !isNullOrUndefined(action))
        .flatten();

    return xs.merge(propsAction$).debug('PracticeFormModalAction') as Stream<PractiseFormAction>;
}
