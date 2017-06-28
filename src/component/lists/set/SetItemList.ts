import { Reducer, Sinks, Sources, State } from "../../../common/interfaces";
import Collection from "@cycle/collection";
import { StateSource } from "cycle-onionify";
import xs, { Stream } from "xstream";
import { div, p } from "@cycle/dom";
import { GetSetsApi } from "../../../common/api/set/GetSets";
import { SetItem } from "./SetItem";

type CardViewSources = Sources & { onion: StateSource<CardViewState> };
type CardViewSinks = Sinks & { onion: Stream<Reducer> };
interface CardViewState extends State {

}

export interface CardItemListProps {
    showRating?: boolean,
    showImport?: boolean,
    requestId: string
}

export default function SetItemList(sources: CardViewSources, props: CardItemListProps): CardViewSinks {

    const {DOM, HTTP} = sources;
    console.log("CardList");
    console.log(sources);

    const tasksState$ = sources.HTTP.select(props.requestId)
        .flatten()
        .map(({text}) => JSON.parse(text))
        .map(items => Object.keys(items)
            .map(key => items[key])
            .map(item => ({
                id: item._id,
                props: {
                    ...item,
                    showRating: props.showRating || false,
                    showImport: props.showImport || false
                }
            })))
        .startWith([]);

    const lessonSets$ = Collection.gather(SetItem, sources, tasksState$, 'id', key => `${key}$`);
    const lessonsListView$ = Collection.pluck(lessonSets$, item => item.DOM);
    const lessonsListRouter$ = Collection.merge(lessonSets$, item => item.router);

    const sinks = {
        DOM: lessonsListView$
            .map(vtree => {

                const list = (vtree.length === 0) ?
                    div('.ui.column', p(['Keine Einträge vorhanden']))
                    : vtree;

                return div('.ui.three.column.doubling.stackable.grid',
                    list
                )
            }),
        router: lessonsListRouter$,
        HTTP: xs.of(GetSetsApi.buildRequest())
    };

    return sinks;
}