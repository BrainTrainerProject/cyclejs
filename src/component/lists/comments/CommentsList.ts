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
import { SetRepository, SetRepositoryAction, SetRepositorySinks } from "../../../common/repository/SetRepository";


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
    setLoaded$: Stream<any>;
}

function intent(commentRepository: SetRepositorySinks): IntentSinks {

    const response = commentRepository.response;

    return {
        setLoaded$: response.getSetById$
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

    const setLoaded$ = intent.setLoaded$
        .map(set => (state) => {
            console.log("LOAD SET");
            console.log(state);
            console.log(set);
            function generateList(valuations: string[]) {
                let list = [];
                valuations.forEach(value =>
                    list.push({
                        key: Date.now(),
                        item: {
                            id: value
                        }
                    })
                );
                return list;
            }

            return {
               ...state,
               list: generateList(set.valuations)
           }
        });

    return xs.merge(initReducer$, setLoaded$).debug('COMMENTS LIST');
}

function commentsListView(items$: Stream<VNode[]>): Stream<VNode> {

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

    const setRepository = SetRepository(sources as any, action$.map(action => SetRepositoryAction.GetSet(action.setId)));

    const commentsRepository = CommentRepository(sources as any,
        action$.map(action => CommentRepositoryAction.GetBySetId(action.setId) as any).debug('XXXXXXXXXXXXXX')
    );

    const listSinks = isolate(StateList, 'list')(sources, CommentItem);
    const reducer$ = reducer(intent(setRepository));

    const profileClick$ = listSinks.callback$
        .filter(callback => callback.type === 'profile-click')
        .map(callback => callback.item);

    return {
        DOM: commentsListView(listSinks.DOM),
        HTTP: xs.merge(commentsRepository.HTTP, setRepository.HTTP),
        onion: xs.merge(reducer$, listSinks.reducer),
        profileClick$: profileClick$
    };
}