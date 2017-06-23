import xs, {Stream} from 'xstream';
import {Reducer, Sinks, Sources, State} from '../../../common/interfaces';
import {AppState} from '../../../app';
import {StateSource} from 'cycle-onionify';
import {a, div, img, p} from '@cycle/dom';
import {GetFeedsApi, GetFeedsApiProps} from '../../../common/api/GetFeeds';
import FeedItemList from './FeedList';


export type FeedPageSources = Sources & { onion: StateSource<AppState>, filter: any };
export type FeedPageSinks = Sinks & { onion: Stream<Reducer>, modal: Stream<any>, filter: Stream<any> };
export interface FeedPageState extends State {
}

export default function FeedPage(sources) {

    const feedListSinks = FeedItemList(sources);

    const feedRequest$ = xs.of(GetFeedsApi.buildRequest({page: 1} as GetFeedsApiProps));
    // TODO stopped here
    // next step einfach die daten für den Feed laden
    return {
        DOM_LEFT: xs.combine(xs.of(div(['DUMP'])), feedListSinks.DOM),
        DOM_RIGHT: xs.of([]),
        HTTP: xs.merge(feedRequest$, feedListSinks.HTTP);
    };
}

function leftView([dump, list]) {

    return [
        div([dump]),
        list
    ];

}