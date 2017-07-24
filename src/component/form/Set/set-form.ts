import xs, { Stream } from 'xstream';
import { StateSource } from 'cycle-onionify';
import { Reducer, Sinks, Sources, State } from '../../../common/interfaces';
import { intent } from './set-form.intent';
import { model } from './set-form.model';
import { view } from './set-form.view';
import { Visibility } from '../../../common/Visibility';
import { ErrorMessageState } from '../../../common/GuiUtils';
import { SetFormAction } from "./set-form.actions";

export type SetFormSources = Sources & { onion: StateSource<SetFormState> };
export type SetFormSinks = Sinks & { onion: Stream<Reducer>, modal: Stream<any> };

export enum Mode {
    CREATE, EDIT
}

export interface SetFormState extends State {
    mode: Mode,
    setId: string,
    imageUrl: string;
    title: string;
    description: string;
    tags: string;
    visibility: Visibility;
    errors: ErrorMessageState;
}


export function SetForm(sources: SetFormSources, action$?: Stream<SetFormAction>): SetFormSinks {

    const state$ = sources.onion.state$;

    const imageProxy$ = xs.create();
    const actions = intent(sources, action$, imageProxy$);
    const reducer$ = model(sources, actions, state$);
    const vdom$ = view(imageProxy$, state$);

    return {
        DOM: vdom$,
        HTTP: reducer$.HTTP,
        onion: reducer$.onion,
        modal: reducer$.modal,
        router: reducer$.router
    } as any
}