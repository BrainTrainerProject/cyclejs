import xs, { Stream } from "xstream";
import sampleCombine from "xstream/extra/sampleCombine";
import { NotecardFormState } from "./index";
import { Reducer } from "../../../interfaces";
import { assoc, assocPath, dissocPath } from "ramda";
import { title } from "@cycle/dom";
import { CRUDType } from "../../common/CrudType";
import { Visibility } from "../../common/Visibility";
import { INP_DESC, INP_TAGS, INP_TITLE } from "./view";
import { jsonHasChilds } from "../../common/Utils";
import { HttpRequest, PostNotecardApi } from "../../common/ApiRequests";

export function model(sources: any, state$: any, intent: any, prevState?: NotecardFormState) {

    const HTTP = sources.HTTP;

    const default$: Stream<Reducer> = xs.of(function defaultReducer(): any {
        if (typeof prevState === 'undefined') {
            return {
                type: CRUDType.ADD,
                title: "",
                description: "",
                tags: "",
                visibility: Visibility.PRIVATE
            }
        }
        return prevState
    });

    const titleChange$: Stream<Reducer> = dynamicInputStream(intent.inputTitle$, 'title', INP_TITLE);
    const descChange$: Stream<Reducer> = dynamicInputStream(intent.inputDescription$, 'description', INP_DESC);
    const tagsChange$: Stream<Reducer> = dynamicInputStream(intent.inputTags$, 'tags', INP_TAGS);

    const visibilityChange$: Stream<Reducer> = intent.selectVisibility$
        .map(ev => {
            for (let child of ev.target.children) {
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
            return assoc('visibility', visibility, prevState)
        });


    const submitValid$: Stream<Reducer> = intent.submit$
        .map(submit => function submitReducer(state) {
            if (state.title == "") {
                state = errorMsg(INP_TITLE, 'Titel eingeben!', state);
            }

            if (state.description == "") {
                state = errorMsg(INP_DESC, 'Beschreibung eingeben!', state);
            }

            if (state.tags == "") {
                state = errorMsg(INP_TAGS, 'Tags eingeben!', state);
            }
            return state;
        });

    const submitRequest$ = intent.submit$
        .compose(sampleCombine(state$))
        .map(([submitEvent, state]) => state)
        .filter(state => isFormValid(state))
        .map(state => generateRequest(state));

    const request$ = submitRequest$;
    const response$ = sources.HTTP
        .select(PostNotecardApi.ID)
        .flatten()
        .debug('response inside notecard form');

    const reducer$ = xs.merge(
        default$,
        titleChange$,
        descChange$,
        tagsChange$,
        visibilityChange$,
        submitValid$
    );

    const sinks = {
        HTTP: xs.merge(request$, response$),
        onion: reducer$
    };

    return sinks;
}

function isFormValid(state) {
    return jsonHasChilds(state.errors)
}

function generateRequest(state): HttpRequest {
    switch (state.type) {
        case CRUDType.ADD:
            return PostNotecardApi.buildRequest({
                'type': state.type,
                'title': state.title,
                'description': state.description,
                'tags': state.tags,
                'visibility': state.visibility
            });
        case CRUDType.DELETE:
            return PostNotecardApi.buildRequest({
                'type': state.type,
                'title': state.title,
                'description': state.description,
                'tags': state.tags,
                'visibility': state.visibility
            });
        case CRUDType.UPDATE:
            return PostNotecardApi.buildRequest({
                'type': state.type,
                'title': state.title,
                'description': state.description,
                'tags': state.tags,
                'visibility': state.visibility
            });
    }
}

function errorMsg(selectorKey, msg, prevState) {
    return assocPath(['errors', selectorKey, 'msg'], msg, prevState)
}

function dynamicInputStream(start$, valueKey, selectorKey): Stream<Reducer> {
    return start$.map(value => function reducer(state) {
        state = dissocPath(['errors', selectorKey], state);
        state = assoc(valueKey, value, state);
        return state;
    })
}