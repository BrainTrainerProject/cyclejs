import xs, {Stream} from 'xstream';
import {Reducer, Sinks, Sources, State} from '../../../common/interfaces';
import {AppState} from '../../../app';
import {StateSource} from 'cycle-onionify';
import {intent} from './intent';
import {model} from './model';
import {viewRight} from './viewRight';
import {viewLeft} from './viewLeft';
import Comments from '../../comments/Comments';
import isolate from '@cycle/isolate';
import List from './List';
import NotecardItemList from '../../lists/notecard/NotecardItemList';

const Route = require('route-parser');

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
    loading: boolean
}

export const ID_NEW_NOTECARD_BTN = '.new-set-btn';
export const ID_RANDOM_NOTECARD_BTN = '.random-notecard-btn';
export const ID_EDIT_SET_BTN = '.edit-set-btn';
export const ID_RATING_BTN = '.new-set-btn';
export const ID_RATING_FORM = '.rating-form';

export default function SetPage(sources) {

    console.log('Set page');

    const {router} = sources;

    const state$ = sources.onion.state$.debug('STATE');
    const actions = intent(sources);
    const reducer = model(actions, state$);

    const {notecardSinks, commentSinks} = loadOtherComponents(sources, state$);

    const leftDOM$ = xs.combine(state$, notecardSinks.DOM, commentSinks.DOM).map(viewLeft);
    const rightDOM$ = viewRight(state$);

    return {
        DOM_LEFT: leftDOM$,
        DOM_RIGHT: rightDOM$,
        HTTP: xs.merge(reducer.HTTP, notecardSinks.HTTP),
        onion: xs.merge(reducer.onion, notecardSinks.onion),
        modal: xs.merge(reducer.modal, notecardSinks.modal)
    };
}

function loadOtherComponents(sources, state$) {

    const getNotecardsSinks = xs.of(state$)
        .flatten()
        .take(1)
        .map(state => {

            return isolate(List, 'notecards')(sources);

            //return isolate(List, 'notecardlist')(sources);
            return isolate(NotecardItemList, 'notecardlist')(sources, {
                setId: (state.set) ? state.set.id : null
            });

        });

    const getCommentsSinks = Comments(sources, {
        setId: '59404bd79eccad225fdd9b8b'
    });

    return {
        notecardSinks: {
            DOM: getNotecardsSinks.map(c => c.DOM || xs.never()).flatten(),
            HTTP: getNotecardsSinks.map(c => c.HTTP || xs.never()).flatten(),
            onion: getNotecardsSinks.map(c => c.onion || xs.never()).flatten(),
            modal: getNotecardsSinks.map(c => c.modal || xs.never()).flatten()
        },
        commentSinks: getCommentsSinks
    };

}