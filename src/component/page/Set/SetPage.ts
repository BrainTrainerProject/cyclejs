import xs, { Stream } from "xstream";
import { Sinks, Sources, State } from "../../../common/interfaces";
import { AppState } from "../../../app";
import { StateSource } from "cycle-onionify";
import { viewRight } from "./viewRight";
import { viewLeft } from "./viewLeft";
import Comments from "../../comments/Comments";
import CardList, { State as ListState } from "../../lists/cards/CardList";
import isolate from "@cycle/isolate";
import flattenConcurrently from "xstream/extra/flattenConcurrently";
import { GetNotecardApi } from "../../../common/api/notecard/GetNotecard";
import { div } from "@cycle/dom";
import { VNode } from "snabbdom/vnode";
import { GetSetApi } from "../../../common/api/set/GetSet";
import { CreateSetFormAction, SetForm } from "../../form/Set/SetForm";
import { ModalAction } from "cyclejs-modal";
import NotecardForm, { CreateNotecardFormAction } from "../../form/Notecard/Notecard";
import { PostNotecardApi } from "../../../common/api/notecard/PostNotecard";
import { UpdateNotecardApi } from "../../../common/api/notecard/UpdateNotecard";

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
    },
    rating: {
        comment: string,
        rating: number
    },
    list: ListState,
    loading: boolean
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


function intent({HTTP, router, DOM}, state$): Actions {

    const route$ = router.history$;

    const createNotecardClicked$ = DOM.select(ID_NEW_NOTECARD_BTN).events('click');
    const showRandomNotecardClicked$ = DOM.select(ID_RANDOM_NOTECARD_BTN).events('click');
    const editSetClicked$ = DOM.select(ID_EDIT_SET_BTN).events('click');

    const getSetId$ = route$
        .map(v => v.pathname)
        .map(path => {
            const route = new Route('/set/:id');
            return route.match(path);
        });

    const httpPostResponse$ = getSetId$
        .map(route => HTTP.select(PostNotecardApi.ID + route.id).flatten())
        .flatten()
        .map(({text}) => JSON.parse(text));

    const httpUpdateResponse$ = getSetId$
        .map(route => HTTP.select(UpdateNotecardApi.ID + route.id).flatten())
        .flatten()
        .map(({text}) => JSON.parse(text));

    const httpRequestSet$ = getSetId$.map(route => {
        return GetSetApi.buildRequest({
            id: route.id
        });
    });

    const httpResponseSet$ = HTTP.select(GetSetApi.ID)
        .flatten()
        .map(({text}) => JSON.parse(text));

    const httpRequestNotecards$ = httpResponseSet$
        .map(obj => obj.notecard)
        .map(notecards => xs.fromArray(notecards)
            .map(id => GetNotecardApi.buildRequest({
                id: id,
                requestId: id
            }))
        ).flatten();

    const httpResponseNotecards$ = HTTP.select()
        .compose(flattenConcurrently)
        .filter(res => res.request.category.substr(0, GetNotecardApi.ID.length) === GetNotecardApi.ID)
        .map(({text}) => JSON.parse(text));


    const httpChangesResponse$ = xs.merge(httpPostResponse$, httpPostResponse$, httpUpdateResponse$);
    const httpRequests$ = xs.merge(httpRequestSet$, httpRequestNotecards$);

    return {
        getSetId$,

        httpResponseNotecards$,
        httpResponseSet$,

        httpChangesResponse$,

        createNotecardClicked$,
        showRandomNotecardClicked$,
        editSetClicked$,

        httpRequests$
    };

}

function model(actions: Actions): Stream<Reducer> {

    const initReducer$ = xs.of(function initReducer(prev?: State): State {
        return {
            ...prev,
            list: [],
        };
    });

    const setReducer$ = actions.httpResponseSet$
        .map(set => (state) => {
            return {
                ...state,
                set: set,
            };
        });

    const changeReducer$ = actions.httpChangesResponse$
        .map(change => (state) => {
            return {
                ...state,
                list: updateListState(state, change)
            }
        });

    const addReducer$ = actions.httpResponseNotecards$
        .map(notecard => (state) => {
            return {
                ...state,
                list: addListState(state, notecard),
            };
        });

    return xs.merge(initReducer$, setReducer$, addReducer$, changeReducer$);

}

function addListState(state, notecard): ListState {
    // Add
    return state.list.concat({
        key: String(Date.now()),
        id: notecard._id,
        title: notecard.title,
        showImport: false,
        showRating: false
    })
}

function updateListState(state, notecard): ListState {

    // Update
    for (let i in state.list) {
        if (state.list[i]._id === notecard._id) {
            state.list[i] = notecard;
            return state;
        }
    }

    return addListState(state, notecard)

}

function view(listVNode$: Stream<VNode>): Stream<VNode> {
    return listVNode$.map(ulVNode =>
        div([
            ulVNode
        ])
    );
}


export default function SetPage(sources) {

    console.log('Set page');

    const {router} = sources;

    const state$ = sources.onion.state$.debug('STATE');
    const action = intent(sources, state$);
    const parentReducer$ = model(action);
    const reducer$ = xs.merge(parentReducer$);

    const notecardSinks = isolate(CardList, 'list')(sources);
    const commentSinks = Comments(sources, {
        setId: '59404bd79eccad225fdd9b8b'
    });

    const leftDOM$ = xs.combine(state$, notecardSinks.DOM, commentSinks.DOM).map(viewLeft);
    const rightDOM$ = viewRight(state$);

    const click$ = notecardSinks.action.filter(action => action.type === 'click');
    const openModal$ = click$.mapTo({
        type: 'open',
        props: {
            title: 'Set erstellen',
            action: {
                type: 'create',
            } as CreateSetFormAction
        },
        component: SetForm
    } as ModalAction);

    const openCreateNotecardModal$ = action.createNotecardClicked$
        .mapTo(state$.map(state => state.set._id))
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

    return {
        DOM_LEFT: leftDOM$,
        DOM_RIGHT: rightDOM$,
        HTTP: action.httpRequests$,
        onion: xs.merge(reducer$),
        modal: xs.merge(openCreateNotecardModal$, openModal$)
    };
}
