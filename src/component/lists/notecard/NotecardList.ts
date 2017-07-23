import xs, { Stream } from 'xstream';
import { div, DOMSource, p, VNode } from '@cycle/dom';
import { StateSource } from 'cycle-onionify';
import { ListState, StateList } from '../StateList';
import isolate from '@cycle/isolate';
import { HTTPSource } from '@cycle/http';
import flattenSequentially from 'xstream/extra/flattenSequentially';
import { HttpRequest } from '../../../common/api/HttpRequest';
import concat from 'xstream/extra/concat';
import { Utils } from '../../../common/Utils';
import {
    NotecardRepository,
    RequestMethod as NotecardRequestMethod,
    ResponseSinks
} from '../../../common/repository/NotecardRepository';
import { CardItem } from '../CardItem';
import { RootRepositorySinks } from '../../../common/repository/Repository';

export enum ActionType {
    GET_BY_SET_ID = 'load-by-set'
}

export type LoadNotecardsBySetIdAction = {
    type: ActionType.GET_BY_SET_ID;
    setId: string;
};

export type Action = LoadNotecardsBySetIdAction;

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
    itemClick$: Stream<object>;
};

function listView(items$): Stream<VNode> {

    const loading$ = xs.of(div('.ui.column', p(['Loading...'])));

    const emptyList$ = items$
        .filter(items => !items || (items && items.length === 0))
        .mapTo(div('.ui.column', p(['Keine Einträge vorhanden'])));

    const list$ = items$
        .filter(items => (items && items.length > 0))
        .map(items => div('.ui.three.column.doubling.stackable.grid',
                items
            )
        );

    return xs.merge(loading$, emptyList$, list$)
}

export function NotecardListComponent(sources: Sources, action$: Stream<Action>): Sinks {

    const notecardRepository = NotecardRepository(sources as any, listIntents(action$));

    const listSinks = isolate(StateList, 'list')(sources, CardItem);
    const reducer$ = reducer(intent(notecardRepository));

    const itemClick$ = listSinks.callback$.filter(callback => callback.type === 'click')
        .map(callback => callback.item).debug('ItemClick$');

    return {
        DOM: listView(listSinks.DOM),
        HTTP: xs.merge(notecardRepository.HTTP),
        onion: reducer$.debug("ONION NoteListComponent"),
        itemClick$: itemClick$
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
        })).debug("SHOW LIST")

    return xs.merge(showList$).remember();

}

interface IntentSinks {
    showNotecardsFromSet$: Stream<any>;
}

function intent(notecardRepository: RootRepositorySinks): IntentSinks {

    const response = notecardRepository.response as ResponseSinks;
    return {
        showNotecardsFromSet$: response.getNotecardsFromSet$.debug("GET NOTES")
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
        console.log("INIT NOTECARD")
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

    const fillListReducer$ = xs.merge(intent.showNotecardsFromSet$.debug("ITEMMMSSMSMSMS"))
        .map(s => concat(clearSets$, fillListByResponse$(xs.of(s)).debug("FILLLLLLLLLLLLLLLLLL"))).flatten();

    return xs.merge(initReducer$, fillListReducer$);
}
