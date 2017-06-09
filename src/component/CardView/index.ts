import {Reducer, Sinks, Sources, State} from '../../interfaces';
import {StateSource} from 'cycle-onionify';
import xs, {Stream} from 'xstream';
import Collection from '@cycle/collection';
import {div} from '@cycle/dom';
import {defaultView, DefaultViewProps} from './defaultView';
import {GetNotecardsApi} from '../common/ApiRequests';
const R = require('ramda');

export type CardViewSources = Sources & { onion: StateSource<CardViewState> };
export type CardViewSinks = Sinks & { onion: Stream<Reducer> };
export interface CardViewState extends State {

}

function CardItem(sources) {

    const props$ = sources.props$;

    return {
        DOM: props$.map(i => defaultView({
            title: i.title
        } as DefaultViewProps))
    };

}

export default function CardView(sources: CardViewSources): CardViewSinks {

    const HTTP = sources.HTTP;
    const DOM = sources.DOM;

    const tasksState$ = HTTP.select(GetNotecardsApi.ID)
        .flatten()
        .map(({text}) => JSON.parse(text))
        .map(items => Object.keys(items)
            .map(key => items[key])
            .map(item => ({
                id: item.id,
                props: item
            })))
        .startWith([]);

    const lessonSets$ = Collection.gather(CardItem, sources, tasksState$, 'id', key => `${key}$`);

    const refreshList$ = xs.periodic(1000)
        .startWith(0)
        .mapTo(GetNotecardsApi.buildRequest());

    const lessonsListView$ = Collection.pluck(lessonSets$, item => item.DOM);

    const sinks = {
        DOM: lessonsListView$.map(vtree => div('.ui.three.column.doubling.stackable.masonry.grid', vtree)),
        HTTP: refreshList$
    };

    return sinks;
}