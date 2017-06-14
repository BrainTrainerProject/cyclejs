import { Reducer, Sinks, Sources, State } from "../../../common/interfaces";
import { GetSetsApi } from "../../../common/api/GetSets";
import { CardItem } from "./CardItem";
import Collection from "@cycle/collection";
import { StateSource } from "cycle-onionify";
import xs, { Stream } from "xstream";

export type CardViewSources = Sources & { onion: StateSource<CardViewState> };
export type CardViewSinks = Sinks & { onion: Stream<Reducer> };
export interface CardViewState extends State {

}

export interface CardViewProps {
    showRating: boolean,
    showImport: boolean
}

export default function CardView(sources: CardViewSources, props: CardViewProps): CardViewSinks {

    const {DOM, HTTP} = sources;

    const tasksState$ = HTTP.select(GetSetsApi.ID)
        .flatten()
        .map(({text}) => JSON.parse(text))
        .map(items => Object.keys(items)
            .map(key => items[key])
            .map(item => ({
                id: item._id,
                props: item
            })))
        .startWith([]);

    const lessonSets$ = Collection.gather(CardItem, sources, tasksState$, 'id', key => `${key}$`);

    const refreshList$ = xs.of(GetSetsApi.buildRequest());

    const lessonsListView$ = Collection.pluck(lessonSets$, item => item.DOM);

    const sinks = {
        DOM: lessonsListView$,
        HTTP: refreshList$
    };

    return sinks;
}