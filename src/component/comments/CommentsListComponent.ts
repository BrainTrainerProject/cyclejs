import xs, {Stream} from 'xstream';
import {DOMSource, VNode} from '@cycle/dom';
import {StateSource} from 'cycle-onionify';
import ActionList, {State as ListState} from '../ActionList';
import isolate from '@cycle/isolate';
import {HTTPSource} from '@cycle/http';
import flattenSequentially from 'xstream/extra/flattenSequentially';
import {HttpRequest} from '../../../common/api/HttpRequest';
import concat from 'xstream/extra/concat';
import {Utils} from '../../../common/Utils';
import {
    NotecardRepository,
    RequestMethod as NotecardRequestMethod,
    ResponseSinks
} from '../../../common/repository/NotecardRepository';
import {CardItem} from '../CardItem';
import {RepositorySinks} from '../../../common/repository/RepositoryInterfaces';
import { CommentItem } from "./list/CommentItem";

export enum ActionType {
    GET_BY_SET_ID = 'load-comments-by-set'
}

export type LoadCommentsBySetIdAction = {
    type: ActionType.GET_BY_SET_ID;
    setId: string;
};

export type Action = LoadCommentsBySetIdAction;

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

export function CommentsList(sources: Sources, action$: Stream<Action>): Sinks {

    const commentsRepository = CommentsRepository(sources as any, listIntents(actions$));

    const listSinks = isolate(ActionList, 'list')(sources, CommentItem);
    const reducer$ = reducer(intent(commentsRepository));

    const profileClick$ = listSinks.callback$
        .filter(callback => callback.type === 'profile-click')
        .map(callback => callback.item);

    return {
        DOM: listSinks.DOM,
        HTTP: xs.merge(commentsRepository.HTTP),
        onion: reducer$,
        profileClick$: profileClick$
    };
}

function listIntents(action$: Stream<Action>): Stream<any> {

    const showList$ = action$
        .map(action => {
            console.log('ACTION');
            console.log(action);
            return action;
        })
        .filter(action => action.type === ActionType.GET_BY_SET_ID)
        .map(action => ({
            type: NotecardRequestMethod.GET_NOTECARDS_FROM_SET,
            setId: action.setId
        })).debug('SHOW LIST');

    return xs.merge(showList$).remember();

}

interface IntentSinks {
    showNotecardsFromSet$: Stream<any>;
}

function intent(notecardRepository: RepositorySinks): IntentSinks {

    const response = notecardRepository.response as ResponseSinks;
    return {
        showNotecardsFromSet$: response.getNotecardsFromSet$.debug('GET NOTES')
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
        console.log('INIT NOTECARD');
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

    const fillListReducer$ = xs.merge(intent.showNotecardsFromSet$.debug('ITEMMMSSMSMSMS'))
        .map(s => concat(clearSets$, fillListByResponse$(xs.of(s)).debug('FILLLLLLLLLLLLLLLLLL'))).flatten();

    return xs.merge(initReducer$, fillListReducer$);
}
