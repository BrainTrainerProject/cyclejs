import { Stream } from "xstream";
import { StateSource } from "cycle-onionify";
import { Reducer, Sinks, Sources, State } from "../../../interfaces";
import { intent } from "./intent";
import { model } from "./model";
import { view } from "./view";
import { Visibility } from "../../common/visibility";
import { CRUDType } from "../../common/CrudType";

export type NotecardFormSources = Sources & { onion: StateSource<NotecardFormState> };
export type NotecardFormSinks = Sinks & { onion: Stream<Reducer> };
export interface NotecardFormState extends State {
    isLoading: false,
    type: CRUDType,
    title: String,
    description: String,
    tags: String,
    visibility: Visibility
}

function NotecardForm(sources: NotecardFormSources): NotecardFormSinks {

    const state$ = sources.onion.state$;
    const action$ = intent(sources);
    const reducer$ = model(sources, state$, action$);
    const vdom$ = view(state$);

    const sinks = {
        DOM: vdom$,
        HTTP: reducer$.HTTP,
        onion: reducer$.onion
    };
    return sinks;
}

export default NotecardForm;