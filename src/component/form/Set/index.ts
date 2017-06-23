import {Stream} from 'xstream';
import {StateSource} from 'cycle-onionify';
import {Reducer, Sinks, Sources, State} from '../../../common/interfaces';
import {intent} from './intent';
import {model} from './model';
import {view} from './view';
import {Visibility} from '../../../common/Visibility';
import {CRUDType} from '../../../common/CRUDType';
import {ErrorMessageState} from '../../../common/GuiUtils';

export type SetFormSources = Sources & { onion: StateSource<SetFormState> };
export type SetFormSinks = Sinks & { onion: Stream<Reducer> };
export interface SetFormState extends State {
    isLoading: false;
    type: CRUDType;
    imageUrl: string;
    title: string;
    description: string;
    tags: string;
    visibility: Visibility;
    errors: ErrorMessageState;
}

function SetForm(sources: SetFormSources): SetFormSinks {

    const state$ = sources.onion.state$;
    const action$ = intent(sources);
    const reducer$ = model(sources, state$, action$);
    const vdom$ = view(state$);

    const sinks = {
        DOM: vdom$,
        HTTP: reducer$.HTTP,
        onion: reducer$.onion,
        modal: reducer$.modal
    };
    return sinks;
}

export default SetForm;