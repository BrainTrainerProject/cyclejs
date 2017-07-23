import xs, { Stream } from 'xstream';
import { div, DOMSource, p, VNode } from '@cycle/dom';
import { StateSource } from 'cycle-onionify';
import { ListState, StateList } from '../StateList';
import isolate from '@cycle/isolate';
import { HTTPSource } from '@cycle/http';
import flattenSequentially from 'xstream/extra/flattenSequentially';
import concat from 'xstream/extra/concat';
import { CommentItem } from "../../comments/list/CommentItem";
import {
    CommentRepository,
    CommentRepositoryAction,
    CommentRepositorySinks
} from "../../../common/repository/CommentRepository";
import { HttpRequest } from "../../../common/api/HttpRequest";
import { Utils } from "../../../common/Utils";


export enum ActionType {
    GET_BY_SET_ID = 'load-comments-by-set'
}

export const CommentListAction = {

    GetBySetId: (setId: string) => ({
        type: ActionType.GET_BY_SET_ID,
        setId: setId
    })

};

export type State = {
    list: ListState
};

export type Reducer = (prev?: State) => State | undefined;

export type Sources = {
    DOM: DOMSource;
    HTTP: HTTPSource;
    onion: StateSource<State>;
};

export type Sinks = {
    DOM: Stream<VNode>;
    HTTP: Stream<HttpRequest>;
    onion: Stream<Reducer>;
    profileClick$: Stream<object>;
};


function listIntents(action$: Stream<any>): Stream<any> {

    const showList$ = xs.never();

    return xs.merge(showList$).remember();

}

interface IntentSinks {
    commentsLoaded$: Stream<any>;
}

function intent(commentRepository: CommentRepositorySinks): IntentSinks {

    const response = commentRepository.response;

    return {
        commentsLoaded$: response.getCommentBySetIdResponse$.debug('Request CRA')
    };

}

function defaultState(state: State): State {
    return {
        ...state,
        list: []
    };
}

function reducer(intent: IntentSinks): Stream<any> {

    const initReducer$ = xs.of((state) => {
        if (state) {
            return state;
        }
        return defaultState(state);
    });

    const clearSets$ = xs.of((state) => ({
        ...state,
        list: []
    }));

    function fillListByResponse$(stream$: Stream<any>): Stream<any> {
        return stream$
            .map(array => {
                console.log("FILL ARRAYY")
                console.log(array);
                return array;
            })
            .map(array => xs.fromArray(array))
            .compose(flattenSequentially)
            .map(item => (state) => {
                console.log('ITEM');
                console.log(item);
                // Verzögerung notwendig, sonst kommt es zu 'race condition' mit dem vdom$
                Utils.syncDelay(1);

                return ({
                    ...state,
                    list: state.list.concat({
                        key: Date.now(),
                        item: {...item}
                    })
                });
            });
    }

    const fillListReducer$ = xs.merge(intent.commentsLoaded$.debug('ITEMMMSSMSMSMS'))
        .map(s => concat(clearSets$, fillListByResponse$(xs.of(s)).debug('FILLLLLLLLLLLLLLLLLL'))).flatten();

    return xs.merge(initReducer$, fillListReducer$);

}

function commentsListView(items$): Stream<VNode> {

    const loading$ = xs.of(div('.ui.column', p(['Loading...'])));

    const emptyList$ = items$
        .filter(items => !items || (items && items.length === 0))
        .mapTo(div('.ui.column', p([''])));

    const list$ = items$
        .filter(items => (items && items.length > 0))
        .map(items => div('.ui.grid', items));

    return xs.merge(loading$, emptyList$, list$);

}

export function CommentsList(sources: Sources, action$: Stream<any>): Sinks {

    const commentsRepository = CommentRepository(sources as any,
        action$.map(action => CommentRepositoryAction.GetBySetId(action.setId) as any).debug('Request CRA')
    );

    const listSinks = isolate(StateList, 'list')(sources, CommentItem);
    const reducer$ = reducer(intent(commentsRepository));

    const profileClick$ = listSinks.callback$
        .filter(callback => callback.type === 'click-profile')
        .map(callback => callback.item)
        .map(item => item.profile._id)

    return {
        DOM: commentsListView(listSinks.DOM),
        HTTP: xs.merge(commentsRepository.HTTP),
        onion: xs.merge(reducer$, listSinks.reducer),
        profileClick$: profileClick$
    };
}