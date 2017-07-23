import xs, { Stream } from 'xstream';
import { div, DOMSource, VNode } from '@cycle/dom';
import { StateSource } from 'cycle-onionify';
import { ListState, StateList } from '../StateList';
import isolate from '@cycle/isolate';
import { HTTPSource } from '@cycle/http';
import flattenSequentially from 'xstream/extra/flattenSequentially';
import concat from 'xstream/extra/concat';
import { RequestMethod as NotecardRequestMethod, ResponseSinks } from '../../../common/repository/NotecardRepository';
import { RootRepositorySinks } from '../../../common/repository/Repository';
import { CommentItem } from "../../comments/list/CommentItem";
import { CommentRepository, CommentRepositorySinks } from "../../../common/repository/CommentRepository";
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
        commentsLoaded$: response.getCommentBySetIdResponse$.debug('GET COMMENT')
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
        return stream$.map(array => xs.fromArray(array))
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

export function CommentsList(sources: Sources, action$: Stream<any>): Sinks {

    const commentsRepository = CommentRepository(sources as any, xs.never());

    const listSinks = isolate(StateList, 'list')(sources, CommentItem);
    const reducer$ = reducer(intent(commentsRepository));

    const profileClick$ = listSinks.callback$
        .filter(callback => callback.type === 'profile-click')
        .map(callback => callback.item);

    return {
        DOM: xs.of(div(['{{CommentsList}}'])),
        HTTP: xs.merge(commentsRepository.HTTP),
        onion: reducer$,
        profileClick$: profileClick$
    };
}