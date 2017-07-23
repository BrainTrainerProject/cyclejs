import { Stream } from 'xstream';
import { StateSource } from 'cycle-onionify';
import { Reducer, Sinks, Sources, State } from '../../../common/interfaces';
import { intent } from './intent';
import { model } from './model';
import { view } from './view';
import { Visibility } from '../../../common/Visibility';
import { ErrorMessageState } from '../../../common/GuiUtils';

export type SetFormSources = Sources & { onion: StateSource<SetFormState> };
export type SetFormSinks = Sinks & { onion: Stream<Reducer> };

export enum Mode {
    CREATE, EDIT
}

export interface SetFormState extends State {
    mode: Mode,
    action: SetFormAction;
    imageUrl: string;
    title: string;
    description: string;
    tags: string;
    visibility: Visibility;
    errors: ErrorMessageState;
}

export const SetFormActions = {

    Create: (): CreateSetFormAction => ({
        type: 'create'
    }),

    Edit: (setId: string): EditSetFormAction => ({
        type: 'edit',
        setId: setId
    }),

};

export interface CreateSetFormAction {
    type: 'create'
}

export interface EditSetFormAction {
    type: 'edit';
    setId: string;
}

export interface DeleteSetFormAction {
    type: 'delete';
    setId: string;
}

export type SetFormAction = EditSetFormAction | CreateSetFormAction | DeleteSetFormAction;

export function SetForm(sources: SetFormSources): SetFormSinks {

    const state$ = sources.onion.state$;
    const action$ = intent(sources);
    const reducer$ = model(sources, state$, action$, loadAction(sources));
    const vdom$ = view(state$);

    const sinks = {
        DOM: vdom$,
        HTTP: reducer$.HTTP,
        onion: reducer$.onion,
        modal: reducer$.modal,
        router: reducer$.router
    };
    return sinks;
}

function loadAction(sources): SetFormAction {
    if (sources.props && sources.props.action) {
        return {...sources.props.action};
    }
    return {type: 'create'} as CreateSetFormAction;
}