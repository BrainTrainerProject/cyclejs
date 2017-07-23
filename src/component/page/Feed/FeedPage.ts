import xs, { Stream } from 'xstream';
import { Reducer, Sinks, Sources, State } from '../../../common/interfaces';
import { AppState } from '../../../app';
import { StateSource } from 'cycle-onionify';
import { FeedList, FeedListAction } from "../../lists/FeedList";
import isolate from "@cycle/isolate";

export type FeedPageSources = Sources & { onion: StateSource<AppState>, filter: any };
export type FeedPageSinks = Sinks & { onion: Stream<Reducer>, modal: Stream<any>, filter: Stream<any> };

export interface FeedPageState extends State {
}

export default function FeedPage(sources) {

    const feedList = isolate(FeedList, 'feeds')(sources,
        xs.of(FeedListAction.GetByOwn())
    );

    return {
        DOM_LEFT: feedList.DOM,
        DOM_RIGHT: xs.of([]),
        HTTP: feedList.HTTP,
        onion: feedList.onion
    };

}
