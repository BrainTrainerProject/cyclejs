import xs,{Stream} from 'xstream';
import {StateSource} from 'cycle-onionify';
import {Reducer, Sinks, Sources, State} from '../../../common/interfaces';
import {intent} from './intent';
import {model} from './model';
import {view} from './view';
import {Visibility} from '../../../common/Visibility';
import {CRUDType} from '../../../common/CRUDType';
import { GetNotecardsApi } from "../../../common/api/GetNotecards";

export type NotecardFormSources = Sources & { onion : StateSource<NotecardFormState> };
export type NotecardFormSinks = Sinks & { onion : Stream<Reducer> };
export interface NotecardFormState extends State {
    isLoading : false;
    type : CRUDType;
    imageUrl: string;
    title : string;
    description : string;
    tags : string;
    visibility : Visibility;
    errors : {};
}

function NotecardForm(sources : NotecardFormSources) : NotecardFormSinks {

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