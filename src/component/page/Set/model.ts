import xs from "xstream";
import { SetPageState } from "./SetPage";
import { Utils } from "../../../common/Utils";
import { ModalAction } from "cyclejs-modal";
import { GetPracticeApi, GetPracticeProps } from "../../../common/api/GetPractice";
import { SetForm } from "../../form/Set/set-form";
import { EditSetFormAction } from "../../form/Set/set-form.actions";

export function model(action: any, state$) {

    const sinks = {
        onion: reducer(action),
        HTTP: httpRequests(action),
        modal: modalRequests(action, state$)
    };

    return sinks;

}

function modalRequests(action: any, state$): any {

    const openEditSetModal$ = action.editSet$
        .mapTo(state$.map(state => state.set.id))
        .flatten()
        .take(1)
        .map(id => ({
            type: 'open',
            props: {
                title: 'Set bearbeiten',
                action: {
                    type: 'edit',
                    setId: id
                } as EditSetFormAction
            },
            component: SetForm
        } as ModalAction));

    const openCreateNotecardModal$ = action.createNotecard$
        .mapTo(state$.map(state => state.set.id))
        .flatten()
        .take(1)
        .map(id => ({
            type: 'open',
            props: {
                title: 'Notecard erstellen',
                action: {
                    type: 'create',
                    setId: id
                } as CreateNotecardFormAction
            },
            component: NotecardForm
        } as ModalAction));

    return xs.merge(openEditSetModal$, openCreateNotecardModal$);

}

function httpRequests(action: any) {

    const requestRandomNotecard$ = action.showRandomNotecard$
        .mapTo(GetPracticeApi.buildRequest({requestId: ''} as GetPracticeProps));


    return xs.merge(requestRandomNotecard$, action.requestSetInfo$);

}

function reducer(action: any) {

    const initReducer$ = xs.of(function initReducer(state) {
        return {
            set: {
                id: '',
                title: '',
                description: '',
                photourl: Utils.imageOrPlaceHolder(null),
                notecards: []
            },
            rating: {
                comment: '',
                rating: 1
            },
            loading: true
        } as SetPageState;
    });

    const loadSetInfoReducer$ = action.responseSetInfo$
        .filter(response => response.ok)
        .map(response => JSON.parse(response.text))
        .map(set => function loadSetInfoReducer(state) {
            console.log('LOAD: ', set);
            return {
                ...state,
                set: {
                    ...state.set,
                    id: set._id,
                    title: set.title,
                    description: set.description,
                    image: Utils.imageOrPlaceHolder(set.photourl),
                    notecards: set.notecard
                }
            };
        }).debug('RESPONSE');

    return xs.merge(
        initReducer$,
        loadSetInfoReducer$
    );

}