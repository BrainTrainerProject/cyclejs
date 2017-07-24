import xs, { Stream } from "xstream";
import { StateSource } from "cycle-onionify";
import { Reducer, Sinks, Sources, State } from "../../../common/interfaces";
import { isNullOrUndefined } from "util";
import { PracticeFormAction } from "./practise-form.actions";
import { div } from "@cycle/dom";

export type PracticeFormSources = Sources & { onion: StateSource<PracticeFormState> };
export type PracticeFromSinks = Sinks & { onion: Stream<Reducer> };

export enum Mode {
    PRACTISE, PRAC
    PRACTICE_MULTI, PRACTICE, SHOW
}

export interface PracticeFormState extends State {
    mode: Mode,
    notecardId: string,
    practices: string[],
}

export function PracticeForm(sources: PracticeFormSources, action$?: Stream<PracticeFormAction>): PracticeFromSinks {

    /*const state$ = sources.onion.state$;
    const actions = intent(sources, combineActions(sources, action$));
    const reducer = model(sources, actions, state$);

    return {
        DOM: view(state$),
        onion: reducer.onion,
        HTTP: reducer.HTTP,
        modal: reducer.modal
    };*/

    return {
        DOM: xs.of(div(['practise'])),
        onion: xs.never(),
        HTTP: xs.never(),
        modal: xs.never()
    }

}

function combineActions(sources: PracticeFormSources, action$?: Stream<PracticeFormAction>): Stream<PracticeFormAction> {

    const propsAction$ = xs.of(sources)
        .filter(src => !!(src as any).props.action)
        .map(src => (src as any).props.action);

    const directAction$ = xs.of(action$)
        .filter(action => !isNullOrUndefined(action))
        .flatten();

    return xs.merge(propsAction$, directAction$).debug('PracticeFormModalAction') as Stream<PracticeFormAction>;
}
