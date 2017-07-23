import xs, { Stream } from "xstream";
import { StateSource } from "cycle-onionify";
import { Reducer, Sinks, Sources, State } from "../../../common/interfaces";
import { ErrorMessageState } from "../../../common/GuiUtils";
import { NotecardFormAction } from "./notecard-form.actions";
import { intent } from "./notecard-form.intent";
import { model } from "./notecard-form.model";
import { view } from "./notecard-form.view";
import { isNullOrUndefined } from "util";

export type NotecardFormSources = Sources & { onion: StateSource<NotecardFormState> };
export type NotecardFromSinks = Sinks & { onion: Stream<Reducer> };

export enum Mode {
    CREATE, EDIT
}

export interface NotecardFormState extends State {
    mode: Mode,
    setId: string,
    notecardId: string,
    title: string;
    task: string;
    answer: string;
    errors: ErrorMessageState;
}

export function NotecardForm(sources: NotecardFormSources, action$?: Stream<NotecardFormAction>): NotecardFromSinks {

    const state$ = sources.onion.state$;
    const actions = intent(sources, combineActions(sources, action$));
    const reducer = model(sources, actions, state$);

    return {
        DOM: view(state$),
        onion: reducer.onion,
        HTTP: reducer.HTTP,
        modal: reducer.modal
    };

}

function combineActions(sources: NotecardFormSources, action$?: Stream<NotecardFormAction>): Stream<NotecardFormAction> {

    const propsAction$ = xs.of(sources)
        .filter(src => !!(src as any).props.action)
        .map(src => (src as any).props.action);

    const directAction$ = xs.of(action$)
        .filter(action => !isNullOrUndefined(action))
        .flatten();

    return xs.merge(propsAction$, directAction$).debug('NotecardFormModalAction') as Stream<NotecardFormAction>;
}





