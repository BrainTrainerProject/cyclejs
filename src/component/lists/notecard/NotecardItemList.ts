import { Sources, State } from "../../../common/interfaces";
import { StateSource } from "cycle-onionify";
import xs, { Stream } from "xstream";
import { div, p } from "@cycle/dom";
import { GetNotecardApi } from "../../../common/api/notecard/GetNotecard";
import { VNode } from "snabbdom/vnode";
import { RequestOptions } from "@cycle/http";
import { GetSetApi } from "../../../common/api/set/GetSet";
import { NotecardItem } from "./NotecardItem";
import flattenConcurrently from "xstream/extra/flattenConcurrently";
import Collection from "@cycle/collection";
import { GetProfileApi } from "../../../common/api/profile/GetProfile";
import { ModalAction } from "cyclejs-modal";
import NotecardForm, { EditNotecardFormAction, ShowNotecardFormAction } from "../../form/Notecard/Notecard";

export const ID_GET_CARDS = 'get_nested_request';

type NotecardItemListSources = Sources & {
    onion: StateSource<NotecardItemListState>;
    props: any
};

type NotecardItemListSinks = {
    DOM: Stream<VNode>;
    HTTP: Stream<RequestOptions>;
    modal: Stream<any>;
    router: Stream<any>;
    onion: Stream<any>;
};

interface NotecardItemListState extends State {
    currUserId: string,
    setOwnerId: string
}

export interface NotecardItemListProps {
    setId?: string;
}


function userIsOwnerOfNotecards(sources: NotecardItemListSources) {
    const state$ = sources.onion.state$;
    console.log("UserIsOwner");
    return state$.map(state => state.currUserId === state.setOwnerId).flatten()
}

export default function NotecardItemList(sources: NotecardItemListSources, props: NotecardItemListProps): NotecardItemListSinks {

    console.log("Show NestedItemList");

    const {DOM, HTTP} = sources;
    const state$ = sources.onion.state$.debug('STATE');
    const regex = new RegExp('/^' + GetNotecardApi.ID + '*/i');

    const addNotecards$ = HTTP.select()
        .compose(flattenConcurrently)
        .filter(res => res.request.category.substr(0, GetNotecardApi.ID.length) === GetNotecardApi.ID)
        .map(({text}) => JSON.parse(text))
        .map(item => ({
            id: item._id,
            props: {
                ...item
            }
        }));

    const lessonSets$ = Collection(NotecardItem, sources, addNotecards$, item => item.remove$);
    const lessonsListView$ = Collection.pluck(lessonSets$, item => item.DOM);
    const itemClicks$ = Collection.pluck(lessonSets$, item => item.itemClick$);

     // TODO ITEMS CLICKS REALISIEREN.

    const editNotecardForm$ = itemClicks$
        .filter(userIsOwnerOfNotecards(sources))
        .map(id => ({
            type: 'open',
            props: {
                title: 'Set bearbeiten',
                action: {
                    type: 'edit',
                    notecardId: id
                } as EditNotecardFormAction
            },
            component: NotecardForm
        } as ModalAction));

    const showNotecardForm$ = itemClicks$
        .filter(!userIsOwnerOfNotecards(sources))
        .map(id => ({
            type: 'open',
            props: {
                title: 'Notecard ansehen',
                action: {
                    type: 'show',
                    notecardId: id
                } as ShowNotecardFormAction
            },
            component: NotecardForm
        } as ModalAction));

    const reducer = model(sources, props);

    const sinks = {
        DOM: lessonsListView$
            .map(vtree => {

                const list = (vtree.length === 0) ?
                    div('.ui.column', p(['Keine Einträge vorhanden']))
                    : vtree;

                return div('.ui.three.column.doubling.stackable.grid',
                    list
                )
            }),
        HTTP: reducer.HTTP,
        onion: reducer.onion,
        modal: xs.merge(showNotecardForm$, editNotecardForm$)
    };

    return sinks;
}

function model(sources: NotecardItemListSources, props: NotecardItemListProps) {

    const {HTTP} = sources;

    // call set info
    // call notecards
    // show notecards

    const setInfoRequestId = 'notecardItemList';
    const requestSetInfo$ = xs.of(GetSetApi.buildRequest({id: props.setId, requestId: setInfoRequestId}));
    const responseSetInfo$ = HTTP.select(GetSetApi.ID + setInfoRequestId)
        .flatten()
        .map(({text}) => JSON.parse(text));

    const requestNotecards$ = responseSetInfo$
        .map(obj => obj.notecard)
        .map(notecards => xs.fromArray(notecards)
            .map(id => GetNotecardApi.buildRequest({
                id: id,
                requestId: id
            }))
        ).flatten();

    const currUserRequestId = 'own';
    const currUserRequest$ = xs.of(GetProfileApi.buildRequest({id: '', requestId: 'own'}));
    const currUserResponse$ = HTTP.select(GetProfileApi.ID + currUserRequestId)
        .flatten()
        .map(({text}) => JSON.parse(text));

    // Reducer

    const init$ = xs.of(() => {
        return {
            currUserId: null,
            setOwnerId: null,
        } as NotecardItemListState
    });

    const ownerReducer$ = responseSetInfo$
        .map(setInfo => (state) => ({
            ...state,
            setOwnerId: setInfo.owner
        } as NotecardItemListState));

    const userReducer$ = currUserResponse$
        .map(user => (state) => ({
            ...state,
            currUserId: user._id
        } as NotecardItemListState));

    return {
        HTTP: xs.merge(requestSetInfo$, requestNotecards$, currUserRequest$),
        onion: xs.merge(init$, userReducer$, ownerReducer$)
    }

}