import xs, { Stream } from "xstream";
import sampleCombine from "xstream/extra/sampleCombine";
import { Reducer } from "../../../common/interfaces";
import { assoc } from "ramda";
import { title } from "@cycle/dom";
import { Visibility } from "../../../common/Visibility";
import { INP_DESC, INP_TAGS, INP_TITLE } from "./set-form.view";
import { Utils } from "../../../common/Utils";
import { ModalAction } from "cyclejs-modal";
import { inputErrorState, inputStream } from "../../../common/GuiUtils";
import { Mode, SetFormState } from "./set-form";
import { SetRepository, SetRepositoryActions, SetRepositorySinks } from "../../../common/repository/SetRepository";
import { IntentSinks } from "./set-form.intent";
import { ActionType } from "./set-form.actions";

function setRepositoryActions$(notecardRepositoryProxy$, actions: IntentSinks, state$): Stream<any> {

    const loadEditSet$ = actions.editSetAction$
        .map(action => {
            console.log('Action', action);
            return SetRepositoryActions.GetById(action.setId)
        });

    const deleteSet$ = actions.delete$
        .compose(sampleCombine(state$))
        .map(([event, state]) => SetRepositoryActions.Delete(state.setId));

    return xs.merge(notecardRepositoryProxy$.debug('submit proxy'), loadEditSet$, deleteSet$) as Stream<any>

}

export function model(sources: any, actions: IntentSinks, state$: any) {

    const {HTTP} = sources;

    const submitProxy$ = xs.create();
    const setRepository: SetRepositorySinks = SetRepository(sources, setRepositoryActions$(submitProxy$, actions, state$));

    // model
    const init$: Stream<Reducer> = xs.of(function initReducer(): SetFormState {
        return {
            mode: Mode.CREATE,
            setId: '',
            imageUrl: '',
            title: '',
            description: '',
            tags: '',
            visibility: Visibility.PRIVATE,
            errors: [] as any
        }
    });

    const initActions$: Stream<Reducer> = xs.merge(actions.createSetAction$, actions.editSetAction$)
        .map(action => action as any)
        .map(action => (state) => {
            console.log("InitAction$", action);
            return {
                ...state,
                mode: (action.type === ActionType.EDIT) ? Mode.EDIT : Mode.CREATE,
                setId: (!!action.setId) ? action.setId : ''
            };
        });

    const notecardReponseReducer$: Stream<Reducer> = setRepository.response.getSetById$.debug('REPO SETFORM Response')
        .map(set => (state) => {
            console.log("notecardReponseReducer$", set);
            return {
                ...state,
                imageUrl: set.photourl,
                title: set.title,
                description: set.description,
                tags: set.tags,
                visibility: (set.visibility) ? Visibility.PUBLIC : Visibility.PRIVATE
            }
        });

    const imageReducer$: Stream<Reducer> = actions.imageChange$
        .map(image => (state) => {
            console.log("Image change", image);
            return {
                ...state,
                imageUrl: image
            }
        });

    const titleChange$: Stream<Reducer> = inputStream(INP_TITLE, 'title', actions.inputTitle$);
    const descChange$: Stream<Reducer> = inputStream(INP_DESC, 'description', actions.inputDescription$);
    const tagsChange$: Stream<Reducer> = inputStream(INP_TAGS, 'tags', actions.inputTags$);

    const visibilityChange$: Stream<Reducer> = actions.selectVisibility$
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

    const submitValid$: Stream<Reducer> = actions.submit$
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
        init$,
        initActions$,
        titleChange$,
        descChange$,
        tagsChange$,
        visibilityChange$,
        submitValid$,
        imageReducer$,

        notecardReponseReducer$
    );

    // http
    const submitRequest$ = submitValid$
        .compose(sampleCombine(state$))
        .map(([submitEvent, state]) => state)
        .filter(state => !Utils.jsonHasChilds(state.errors))
        .map(state => generateRequest(state));

    submitProxy$.imitate(submitRequest$)

    // modal
    const closeModal$ = xs.merge(submitRequest$, actions.delete$)
        .mapTo({type: 'close'} as ModalAction);

    // router
    const goToSetsIfDelete$ = actions.delete$
        .mapTo('/start');

    const sinks = {
        HTTP: setRepository.HTTP.debug('REPO SETFORM Request'),
        onion: reducer$,
        modal: closeModal$,
        router: goToSetsIfDelete$
    };

    return sinks;
}

function generateRequest(state) {

    const currSetEnitity = {
        title: state.title,
        description: state.description,
        tags: state.tags,
        visibility: state.visibility === Visibility.PUBLIC,
        photourl: state.imageUrl
    };

    switch (state.mode) {
        case Mode.EDIT:
            if (!state.setId) return 'SetForm Modal: error edit request!';
            return SetRepositoryActions.Edit(state.setId, currSetEnitity);

        case Mode.CREATE:

            return SetRepositoryActions.Add(currSetEnitity);

    }
}