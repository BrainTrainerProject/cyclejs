import xs, { Stream } from "xstream";
import sampleCombine from "xstream/extra/sampleCombine";
import { Reducer } from "../../../common/interfaces";
import { assoc } from "ramda";
import { title } from "@cycle/dom";
import { Visibility } from "../../../common/Visibility";
import { INP_DESC, INP_TAGS, INP_TITLE } from "./view";
import { Utils } from "../../../common/Utils";
import { HttpRequest } from "../../../common/api/HttpRequest";
import { PostSetApi } from "../../../common/api/set/PostSet";
import { ModalAction } from "cyclejs-modal";
import { inputErrorState, inputStream } from "../../../common/GuiUtils";
import { SetFormAction } from "./SetForm";
import { GetSetApi, GetSetProps } from "../../../common/api/set/GetSet";
import { DeleteSetApi, DeleteSetProps } from "../../../common/api/set/DeleteSet";
import { UpdateSetApi } from "../../../common/api/set/UpdateSet";
import { SetRepository, SetRepositoryAction, SetRepositorySinks } from "../../../common/repository/SetRepository";

export function model(sources: any, state$: any, intent: any, formAction: SetFormAction) {

    const {HTTP} = sources;

    const setRepository: SetRepositorySinks = SetRepository(sources, xs.never());

    const loadSetData$ = xs.of(formAction)
        .filter(action => action.type == 'edit')
        .map(action => action.setId)
        .map(setId => SetRepositoryAction.GetSet(setId));

    const setDataResponse$ = HTTP.select(GetSetApi.ID)
        .flatten()
        .filter(res => res.ok)
        .map(({text}) => JSON.parse(text));

    // model

    const default$: Stream<Reducer> = xs.of(function defaultReducer(): any {
        return {
            action: formAction,
            id: (formAction.type === 'edit') ? formAction.setId : '',
            title: '',
            description: '',
            tags: '',
            visibility: Visibility.PRIVATE,
            imageUrl: '',
            errors: {}
        };
    });

    const loadedDataReducer$: Stream<Reducer> = setDataResponse$
        .map(res => (state) => {
            return {
                ...state,
                id: res._id,
                title: res.title,
                description: res.description,
                tags: res.tags,
                visibility: res.visibility,
                imageUrl: Utils.imageOrPlaceHolder(res.photourl)
            }
        });

    const titleChange$: Stream<Reducer> = inputStream(INP_TITLE, 'title', intent.inputTitle$);
    const descChange$: Stream<Reducer> = inputStream(INP_DESC, 'description', intent.inputDescription$);
    const tagsChange$: Stream<Reducer> = inputStream(INP_TAGS, 'tags', intent.inputTags$);

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
            if (!state.title) {
                state = inputErrorState(INP_TITLE, 'Titel eingeben!', state);
            }

            if (!state.description) {
                state = inputErrorState(INP_DESC, 'Beschreibung eingeben!', state);
            }

            if (!state.tags) {
                state = inputErrorState(INP_TAGS, 'Tags eingeben!', state);
            }
            return state;
        });

    const reducer$ = xs.merge(
        default$,
        loadedDataReducer$,
        titleChange$,
        descChange$,
        tagsChange$,
        visibilityChange$,
        submitValid$
    );

    // http
    const submitRequest$ = submitValid$
        .compose(sampleCombine(state$))
        .map(([submitEvent, state]) => state)
        .filter(state => !Utils.jsonHasChilds(state.errors))
        .map(state => generateRequest(state));

    const deleteRequest$ = intent.delete$
        .mapTo(state$.map(state => state.id))
        .flatten()
        .take(1)
        .map(id => SetRepositoryAction.Delete(id));

    // modal
    const closeModal$ = xs.merge(submitRequest$, intent.delete$)
        .mapTo({type: 'close'} as ModalAction);

    // router
    const goToSetsIfDelete$ = intent.delete$
        .mapTo('/start');

    const sinks = {
        HTTP: xs.merge(submitRequest$, loadSetData$, deleteRequest$),
        onion: reducer$,
        modal: closeModal$,
        router: goToSetsIfDelete$
    };

    return sinks;
}

function generateRequest(state): HttpRequest {
    switch (state.action.type) {
        case 'edit':
            return SetRepositoryAction.Edit(state.id, getSendValuesFromState(state));

        case 'create':
            return SetRepositoryAction.Add(getSendValuesFromState(state));

    }
}

function getSendValuesFromState(state) {
    return {
        title: state.title,
        description: state.description,
        tags: state.tags,
        visibility: state.visibility === Visibility.PUBLIC,
        photourl: state.imageUrl
    }
}