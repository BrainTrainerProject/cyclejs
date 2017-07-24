import xs, { Stream } from 'xstream';
import { Sinks, Sources, State } from '../../../common/interfaces';
import { AppState } from '../../../app';
import { StateSource } from 'cycle-onionify';
import { viewRight } from './viewRight';
import { viewLeft } from './viewLeft';
import Comments, { CommentsState } from '../../comments/Comments';
import { State as ListState } from '../../lists/cards/CardList';
import isolate from '@cycle/isolate';
import { div } from '@cycle/dom';
import { VNode } from 'snabbdom/vnode';
import { SetRepository, SetRepositoryActions } from '../../../common/repository/SetRepository';
import {
    ActionType as NotecardsActionType,
    NotecardListComponent,
    State as NotecardListState
} from '../../lists/notecard/NotecardList';
import { NotecardFormModal, SetFormModal } from "../../../common/Modals";
import sampleCombine from "xstream/extra/sampleCombine";

const Route = require('route-parser');

export const ID_NEW_NOTECARD_BTN = '.new-set-btn';
export const ID_RANDOM_NOTECARD_BTN = '.random-notecard-btn';
export const ID_EDIT_SET_BTN = '.edit-set-btn';
export const ID_RATING_BTN = '.new-set-btn';
export const ID_RATING_FORM = '.rating-form';

export type Reducer = (prev?: SetPageState) => SetPageState | undefined;

export type SetPageSources = Sources & { onion: StateSource<AppState>, filter: any };
export type SetPageSinks = Sinks & { onion: Stream<Reducer>, modal: Stream<any>, filter: Stream<any> };

export interface SetPageState extends State {
    set: {
        id: string,
        title: string,
        description: string,
        image: string,
        notecards: string[]
    };
    rating: {
        comment: string,
        rating: number
    };
    comments: CommentsState,
    notecardsComponent: NotecardListState;
    loading: boolean;
}

export type Actions = {
    httpRequests$: Stream<any>,
    getSetId$,

    httpResponseNotecards$,
    httpResponseSet$,
    httpChangesResponse$

    createNotecardClicked$,
    showRandomNotecardClicked$,
    editSetClicked$,
}

function intent(sources, state$): any {

    const {router, DOM} = sources;
    const route$ = router.history$;

    const createNotecardClicked$ = DOM.select(ID_NEW_NOTECARD_BTN).events('click');
    const showRandomNotecardClicked$ = DOM.select(ID_RANDOM_NOTECARD_BTN).events('click');
    const editSetClicked$ = DOM.select(ID_EDIT_SET_BTN).events('click');

    const getSetId$ = route$
        .map(v => v.pathname)
        .map(path => {
            const route = new Route('/set/:id');
            return route.match(path);
        })
        .map(route => route.id)
        .remember();

    return {
        getSetId$,
        createNotecardClicked$,
        showRandomNotecardClicked$,
        editSetClicked$
    };

}

function model(actions: Actions): Stream<Reducer> {

    const initReducer$ = xs.of((prev?: SetPageState) => {
        if (prev) {
            return prev;
        } else {
            return {
                ...prev,
                notecardsComponent: {
                    list: []
                }
            } as SetPageState;
        }
    });

    return xs.merge(initReducer$);

}

function httpResponseModel(actions: any): Stream<Reducer> {

    const setReducer$ = actions.getSetById$
        .map(set => (state) => {

            // If comments is empty, init first comments object
            if (!state.comments) {
                state['comments'] = {}
            }

            return {
                ...state,
                set: set,
                comments: {
                    ...state.comments,
                    setId: set._id
                }
            };
        });

    /*const notecardsReducer$ = actions.getNotecardsFromSet$
        .map(notecard => (state) => {
            return {
                ...state,
                list: addListState(state, notecard)
            };
        });*/

    /*const changeReducer$ = actions.httpChangesResponse$
        .map(change => (state) => {
            return {
                ...state,
                list: updateListState(state, change)
            };
        });

    const addReducer$ = actions.httpResponseNotecards$
        .map(notecard => (state) => {
            return {
                ...state,
                list: addListState(state, notecard)
            };
        });*/

    return xs.merge(setReducer$);
}

function addListState(state, notecard): ListState {
    // AddToSet
    return state.list.concat({
        key: String(Date.now()),
        id: notecard._id,
        title: notecard.title,
        owner: notecard.owner,
        showImport: false,
        showRating: false
    });
}

function updateListState(state, notecard): ListState {

    // Update
    for (let i in state.list) {
        if (state.list[i]._id === notecard._id) {
            state.list[i] = notecard;
            return state;
        }
    }

    return addListState(state, notecard);

}

function view(listVNode$: Stream<VNode>): Stream<VNode> {
    return listVNode$.map(ulVNode =>
        div([
            ulVNode
        ])
    );
}

function setRepositoryIntents(action: any): Stream<any> {

    const loadSet$ = action.getSetId$
        .map(id => SetRepositoryActions.GetById(id));

    return xs.merge(loadSet$);
}

function notecardRepositoryIntents(action: any): Stream<any> {

    const loadNotecards$ = action.getSetId$
        .map(id => ({
            type: NotecardsActionType.GET_BY_SET_ID,
            setId: id
        }));

    return xs.merge(loadNotecards$);
}

export default function SetPage(sources: any): any {

    console.log('Set page');

    const {router} = sources;

    const state$ = sources.onion.state$.debug('SETPAGE STATE');
    const action = intent(sources, state$);

    const setRepository = SetRepository(sources, setRepositoryIntents(action));

    const mainReducer$ = model(action);
    const responseReducer$ = httpResponseModel((Object as any).assign(setRepository.response));
    const reducer$ = xs.merge(mainReducer$, responseReducer$);

    const notecardsComponent = isolate(NotecardListComponent, 'notecardsComponent')(sources, notecardRepositoryIntents(action));
    const commentSinks = isolate(Comments, 'comments')(sources);

    const leftDOM$ = xs.combine(state$, notecardsComponent.DOM, commentSinks.DOM).map(viewLeft);
    const rightDOM$ = viewRight(state$);

    const editSet$ = openEditSetModal(action, state$);
    const editNotecard$ = openEditNotecardModal(notecardsComponent.itemClick$, state$);
//    const showNotecard$ = showNotecardModal(show, state$)
    const openCreateNotecardModal$ = openCreateNoteCardModal(action, state$);

    return {
        DOM_LEFT: leftDOM$,
        DOM_RIGHT: rightDOM$,
        HTTP: xs.merge(notecardsComponent.HTTP, setRepository.HTTP, commentSinks.HTTP),
        onion: xs.merge(reducer$, notecardsComponent.onion, commentSinks.onion),
        modal: xs.merge(openCreateNotecardModal$, editSet$, editNotecard$),
        router: commentSinks.router
    };
}

function openCreateNoteCardModal(action, state$) {

    return action.createNotecardClicked$
        .compose(sampleCombine(state$))
        .map(([event, state]) => NotecardFormModal.Create(state.setId));

}

function openEditNotecardModal(click$, state$) {

    return click$
        .compose(sampleCombine(state$))
        .filter(([item, state]) => item.owner === state.user._id)
        .map(([item, state]) => item._id)
        .map(notecardId => NotecardFormModal.Edit(notecardId));

}

function openEditSetModal(action, state$) {

    return action.editSetClicked$
        .compose(sampleCombine(state$))
        .map(([event, state]) => {
            console.log(state);
            return SetFormModal.Edit(state.set._id)
        })
        .debug('SetModal§§')

}