import xs, { Stream } from 'xstream';
import { div, DOMSource, p, VNode } from '@cycle/dom';
import { StateSource } from 'cycle-onionify';
import { ListState, StateList } from './StateList';
import isolate from '@cycle/isolate';
import { HTTPSource } from '@cycle/http';
import flattenSequentially from 'xstream/extra/flattenSequentially';
import concat from 'xstream/extra/concat';
import { CommentItem } from "../comments/list/CommentItem";
import { HttpRequest } from "../../common/api/HttpRequest";
import { Utils } from "../../common/Utils";
import { FeedRepository, FeedRepositoryAction, FeedRepositorySinks } from "../../common/repository/FeedRepository";
import { FeedItem } from "./FeedItem";


export enum ActionType {
    GET_OWN = 'load-own-feed',
    GET_BY_ID = 'load-feed-by-id'
}

export const FeedListAction = {

    GetByOwn: () => ({
        type: ActionType.GET_OWN
    }),

    GetById: (id: string) => ({
        type: ActionType.GET_BY_ID,
        id: id
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

interface IntentSinks {
    ownFeedLoaded$: Stream<any>;
    byIdFeedLoaded$: Stream<any>;
}

function intent(commentRepository: FeedRepositorySinks): IntentSinks {

    const response = commentRepository.response;

    return {
        ownFeedLoaded$: response.getOwnFeedResponse$,
        byIdFeedLoaded$: response.getByIdFeedResponse$
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
            .map(array => xs.fromArray(array))
            .compose(flattenSequentially)
            .map(item => (state) => {

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

    const fillListReducer$ = xs.merge(xs.merge(intent.ownFeedLoaded$, intent.byIdFeedLoaded$))
        .map(s => concat(clearSets$, fillListByResponse$(xs.of(s)))).flatten();

    return xs.merge(initReducer$, fillListReducer$);

}

function commentsListView(items$): Stream<VNode> {

    const loading$ = xs.of(div('.ui.column', p(['Loading...'])));

    const emptyList$ = items$
        .filter(items => !items || (items && items.length === 0))
        .mapTo(div('.ui.column', p(['Keine Einträge vorhanden'])));

    const list$ = items$
        .filter(items => (items && items.length > 0))
        .map(items => div('.ui.grid', items));

    return xs.merge(loading$, emptyList$, list$) as Stream<VNode>;

}

function listActions(action$: Stream<any>) {

    const actionFilter = (type: ActionType) => {
        return action$
            .filter(action => !!action.type)
            .filter(action => action.type === type)
    };

    const loadOwnFeeds$ = actionFilter(ActionType.GET_OWN)
        .map(action => FeedRepositoryAction.GetOwn());

    const loadFeedById$ = actionFilter(ActionType.GET_BY_ID)
        .map(action => FeedRepositoryAction.GetById(action.id));

    return xs.merge(loadOwnFeeds$, loadFeedById$);
}

export function FeedList(sources: Sources, action$: Stream<any>): Sinks {

    const state$ = sources.onion.state$;
    const feedRepository = FeedRepository(sources as any, listActions(action$));

    const listSinks = isolate(StateList, 'list')(sources, FeedItem);
    const reducer$ = reducer(intent(feedRepository));

    const profileClick$ = listSinks.callback$
        .filter(callback => callback.type === 'profile-click')
        .map(callback => callback.item);

    return {
        DOM: commentsListView(listSinks.DOM),
        HTTP: xs.merge(feedRepository.HTTP),
        onion: xs.merge(reducer$, listSinks.reducer),
        profileClick$: profileClick$
    };
}