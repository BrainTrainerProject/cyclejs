import {Reducer, Sinks, Sources, State} from '../../interfaces';
import {StateSource} from 'cycle-onionify';
import xs, {Stream} from 'xstream';
import {div} from '@cycle/dom';
import CardView from '../CardView/index';

export type HomepageSources = Sources & { onion: StateSource<HomepageState> };
export type HomepageSinks = Sinks & { onion: Stream<Reducer>, modal: Stream<any> };
export interface HomepageState extends State {
}

export default function HomePage(sources: HomepageSources): HomepageSinks {

    const lessonsSinks = CardView(sources);
    return {
        DOM: lessonsSinks.DOM,
        HTTP: lessonsSinks.HTTP,
        onion: xs.never(),
        modal: xs.never()
    };

}