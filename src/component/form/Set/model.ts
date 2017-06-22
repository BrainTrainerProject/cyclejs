import xs, {Stream} from 'xstream';
import sampleCombine from 'xstream/extra/sampleCombine';
import {SetFormState} from './index';
import {Reducer} from '../../../common/interfaces';
import {assoc, assocPath, dissocPath} from 'ramda';
import {title} from '@cycle/dom';
import {CRUDType} from '../../../common/CRUDType';
import {Visibility} from '../../../common/Visibility';
import {INP_DESC, INP_TAGS, INP_TITLE} from './view';
import {Utils} from '../../../common/Utils';
import {HttpRequest} from '../../../common/api/HttpRequest';
import {PostSetApi} from '../../../common/api/PostSet';
import {GetNotecardsApi} from '../../../common/api/GetNotecards';
import {ModalAction} from 'cyclejs-modal';

export function model(sources: any, state$: any, intent: any, prevState?: SetFormState) {

    const {HTTP} = sources;

    const default$: Stream<Reducer> = xs.of(function defaultReducer(): any {
        if (typeof prevState === 'undefined') {
            return {
                type: CRUDType.ADD,
                title: '',
                description: '',
                tags: '',
                visibility: Visibility.PRIVATE,
                imageUrl: '',
                errors: {}
            };
        }
        return prevState;
    });

    const titleChange$: Stream<Reducer> = dynamicInputStream(intent.inputTitle$, 'title', INP_TITLE);
    const descChange$: Stream<Reducer> = dynamicInputStream(intent.inputDescription$, 'description', INP_DESC);
    const tagsChange$: Stream<Reducer> = dynamicInputStream(intent.inputTags$, 'tags', INP_TAGS);

    const visibilityChange$: Stream<Reducer> = intent.selectVisibility$
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
            return assoc('visibility', visibility, prevState);
        });

    const submitValid$: Stream<Reducer> = intent.submit$
        .map(submit => function submitReducer(state) {
            if (state.title == '') {
                state = errorMsg(INP_TITLE, 'Titel eingeben!', state);
            }

            if (state.description == '') {
                state = errorMsg(INP_DESC, 'Beschreibung eingeben!', state);
            }

            if (state.tags == '') {
                state = errorMsg(INP_TAGS, 'Tags eingeben!', state);
            }
            return state;
        });

    const submitRequest$ = submitValid$
        .compose(sampleCombine(state$))
        .map(([submitEvent, state]) => state)
        .filter(state => isFormValid(state))
        .map(state => generateRequest(state));

    const request$ = submitRequest$;

    const reducer$ = xs.merge(
        default$,
        titleChange$,
        descChange$,
        tagsChange$,
        visibilityChange$,
        submitValid$
    );

    const successResponse$ = HTTP
        .select(PostSetApi.ID)
        .flatten()
        .filter(response => response.ok).debug('Sussess Response');

    const close$ = successResponse$
        .mapTo({type: 'close'} as ModalAction);

    const sinks = {
        HTTP: request$,
        onion: reducer$,
        modal: close$
    };

    return sinks;
}

function isFormValid(state) {

    let err = 0;
    if (state.title === '') err++;
    if (state.description === '') err++;
    if (state.tags === '') err++;
    if (Utils.jsonHasChilds(state.errors)) err++;
    return err === 0;

}

function generateRequest(state): HttpRequest {
    switch (state.type) {
        case CRUDType.ADD:
            return PostSetApi.buildRequest({
                'type': state.type,
                'title': state.title,
                'description': state.description,
                'tags': state.tags,
                'visibility': state.visibility === Visibility.PUBLIC,
                'photourl': state.imageUrl
            });
        case CRUDType.DELETE:
            return PostSetApi.buildRequest({
                'type': state.type,
                'title': state.title,
                'description': state.description,
                'tags': state.tags,
                'visibility': state.visibility === Visibility.PUBLIC,
                'photourl': state.imageUrl
            });
        case CRUDType.UPDATE:
            return PostSetApi.buildRequest({
                'type': state.type,
                'title': state.title,
                'description': state.description,
                'tags': state.tags,
                'visibility': state.visibility === Visibility.PUBLIC,
                'photourl': state.imageUrl
            });
    }
}

function errorMsg(selectorKey, msg, prevState) {
    return assocPath(['errors', selectorKey, 'msg'], msg, prevState);
}

function dynamicInputStream(start$, valueKey, selectorKey): Stream<Reducer> {
    return start$.map(value => function reducer(state) {
        state = dissocPath(['errors', selectorKey], state);
        state = assoc(valueKey, value, state);
        return state;
    });
}