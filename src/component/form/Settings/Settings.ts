import xs, {Stream} from 'xstream';
import {StateSource} from 'cycle-onionify';
import {Reducer, Sinks, Sources, State} from '../../../common/interfaces';
import {select, option, button, div, form, h4, input, label} from '@cycle/dom';
import {VNode} from 'snabbdom/vnode';
import {errorMessage, ErrorMessageState, inputErrorState, inputStream} from '../../../common/GuiUtils';
import sampleCombine from 'xstream/extra/sampleCombine';
import {Utils} from '../../../common/Utils';
import {ModalAction} from 'cyclejs-modal';
import {Visibility} from '../../../common/Visibility';
import {UpdateProfileApi, UpdateProfileProps} from '../../../common/api/profile/UpdateProfile';
import {GetProfileApi} from '../../../common/api/profile/GetProfile';
import {NotecardFormState} from '../Notecard/Notecard';
import {GetOwnRequest, ProfileRepository, RequestType} from '../../../common/repository/ProfileRepository';

const ID_VISIBILITY = '.settings-visibility';
const ID_CARDS_PER_SESSION = '.settings-cards-per-session';
const ID_INTERVAL = '.settings-interval';
const ID_SUBMIT = '.settings-submit';

export type SettingsFormSources = Sources & { onion: StateSource<SettingsFormState> };
export type SettingsFromSinks = Sinks & { onion: Stream<Reducer> };

export interface SettingsFormState extends State {
    visibility: boolean,
    cardsPerSession: number,
    interval: number
    errors: ErrorMessageState;
}

export default function SettingsForm(sources: SettingsFormSources): SettingsFromSinks {

    const state$ = sources.onion.state$;
    const actions = intent(sources);
    const reducer = model(sources, actions, state$);

    const sinks = {
        DOM: view(state$),
        onion: reducer.onion,
        HTTP: reducer.HTTP,
        modal: reducer.modal
    };

    return sinks;

}

function intent(sources: SettingsFormSources): any {

    const {DOM} = sources;

    const inputInterval$ = DOM.select(ID_INTERVAL).events('input').map(e => e.target.value);
    const inputCardsPerSession$ = DOM.select(ID_CARDS_PER_SESSION).events('input').map(e => e.target.value);
    const selectVisibility$ = DOM.select(ID_VISIBILITY).events('change');
    const submit$ = DOM.select(ID_SUBMIT).events('click');

    return {
        inputInterval$,
        inputCardsPerSession$,
        selectVisibility$,
        submit$
    };
}

function model(sources: any, actions: any, state$: any): any {

    const {HTTP} = sources;

    //const requestProfileData$ = xs.of(GetProfileApi.buildRequest({id: '', requestId: 'own'}));
    const profileRepository = ProfileRepository(sources, xs.of({
        type: RequestType.GET_OWN
    } as GetOwnRequest));

    // Reducer
    const init$: Stream<Reducer> = profileRepository.response.getOwnProfile$
        .map(profile => function initReducer(): any {
            return {
                visibility: profile.visibility,
                cardsPerSession: (profile.cardsPerSession) ? profile.cardsPerSession : 5,
                interval: (profile.interval) ? profile.interval : 30,
                errors: {}
            };
        });

    const intervalReducer$: Stream<Reducer> = inputStream(ID_INTERVAL, 'interval', actions.inputInterval$);
    const perSessionReducer$: Stream<Reducer> = inputStream(ID_CARDS_PER_SESSION, 'cardsPerSession', actions.inputCardsPerSession$);

    const visibilityChangeReducer$: Stream<Reducer> = actions.selectVisibility$
        .map(ev => {
            for (const child of ev.target.children) {
                if (child.selected) {
                    switch (child.value) {
                        case 'private' :
                            return Visibility.PRIVATE;
                        case 'public' :
                            return Visibility.PUBLIC;
                    }
                }
            }
            return Visibility.PRIVATE;
        })
        .map(visibility => function visibilityReducer(prevState) {
            return {
                ...prevState,
                visibility: visibility
            };
        });

    const submitValid$: Stream<Reducer> = actions.submit$
        .map(submit => (state) => {

            // Interval
            if (!state.interval) {
                state = inputErrorState(ID_INTERVAL, 'Interval eingeben!', state);
            } else {
                const isNumber = Utils.isNumber(state.interval);
                if (!isNumber) {
                    state = inputErrorState(ID_CARDS_PER_SESSION, 'Interval muss eine Zahl sein!', state);
                }
            }

            // Cards per session
            if (!state.cardsPerSession) {
                state = inputErrorState(ID_CARDS_PER_SESSION, 'Kateikarten per Session eingeben!', state);
            } else {

                const isNumber = Utils.isNumber(state.cardsPerSession);
                if (!isNumber) {
                    state = inputErrorState(ID_CARDS_PER_SESSION, 'Karteikarten per Session muss eine Zahl sein!', state);
                }

            }

            return state;
        });


    const reducer$ = xs.merge(
        init$,
        intervalReducer$,
        perSessionReducer$,
        visibilityChangeReducer$,
        submitValid$
    );

    // HTTP
    // UPDATE RESQUEST
    const submitRequest$ = submitValid$
        .compose(sampleCombine(state$))
        .map(([submitEvent, state]) => state)
        .filter(state => !Utils.jsonHasChilds(state.errors))
        .map(state => buildSubmitRequest(state));

    // Modal
    const closeModal$ = xs.merge(submitRequest$)
        .mapTo({type: 'close'} as ModalAction);

    return {
        onion: reducer$.debug('REDUCER'),
        HTTP: xs.merge(profileRepository.HTTP, submitRequest$),
        modal: closeModal$
    };
}

function buildSubmitRequest(state) {

    return UpdateProfileApi.buildRequest({
        send: {
            visibility: state.visibility === Visibility.PUBLIC,
            interval: state.interval,
            cardsPerSession: state.cardsPerSession
        }
    } as UpdateProfileProps);

}


export function view(state$: Stream<NotecardFormState>): Stream<VNode> {
    return state$
        .map(state => {
            console.log('State', state);
            return div('.ui.grid', [
                div('.sixteen.wide.column', [
                    form('.ui.form', [
                        h4('.ui.dividing.header', [`Popup`]),
                        div('.field', [
                            label([`Häufigkeit (in Minuten)`]),
                            div('.field', [
                                input(ID_INTERVAL, {
                                    'attrs': {
                                        'type': 'text',
                                        'placeholder': 'Häufigkeit',
                                        'value': state.interval
                                    }
                                })
                            ])
                        ]),
                        div('.field', [
                            label([`Menge`]),
                            div('.field', [
                                input(ID_CARDS_PER_SESSION, {
                                    'attrs': {
                                        'type': 'text',
                                        'placeholder': 'Karteikarten pro Session',
                                        'value': state.cardsPerSession
                                    }
                                })
                            ])
                        ]),
                        h4('.ui.dividing.header', [`Profil`]),
                        div('.field', [
                            label([`Sichtbarkeit`]),
                            div('.field', [
                                select(ID_VISIBILITY + '.ui.right.floated.dropdown', [
                                    option({
                                            'attrs': {
                                                'value': 'private',
                                                'selected': (state.visibility === Visibility.PRIVATE) ? 'selected' : ''
                                            }
                                        },
                                        [`Privat`]
                                    ),
                                    option({
                                        'attrs': {
                                            'value': 'public',
                                            'selected': (state.visibility === Visibility.PUBLIC) ? 'selected' : ''
                                        }
                                    }, [`Öffentlich`])
                                ])
                            ])
                        ]),
                        div('.fields', [
                            div('.eight.wide.field'),
                            div('.four.wide.field.right.floated', []),
                            div('.four.wide.field.', [
                                button(ID_SUBMIT + '.ui.button.right.fluid.floated.', {
                                    'attrs': {
                                        'type': 'submit',
                                    }
                                }, [`speichern`])
                            ])
                        ])
                    ]),
                    errorMessage(state)
                ])
            ]);
        });

}