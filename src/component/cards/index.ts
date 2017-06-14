import { Reducer, Sinks, Sources, State } from "../../common/interfaces";
import { StateSource } from "cycle-onionify";
import xs, { Stream } from "xstream";
import Collection from "@cycle/collection";
import { button, div } from "@cycle/dom";
import { defaultView, DefaultViewProps } from "./defaultView";
import { GetNotecardsApi } from "../../common/api/GetNotecards";
import { Utils } from "../../common/Utils";
import { GetSetsApi } from "../../common/api/GetSets";
const R = require('ramda');

export type CardViewSources = Sources & { onion: StateSource<CardViewState> };
export type CardViewSinks = Sinks & { onion: Stream<Reducer> };
export interface CardViewState extends State {

}

function CardItem(sources) {
    const props$ = sources.props$;
    return {
        DOM: props$.map(set => {
            return defaultView({
                title: set.title,
                imageUrl: Utils.imageUrl('/card-placeholder.png'),
                url: "/set/" + set._id,
                rating: 3,
                ratingCount: 42
            } as DefaultViewProps)
        })
    };

}

export default function CardView(sources: CardViewSources): CardViewSinks {

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
        DOM: lessonsListView$.map(vtree =>
            div([
                div('.simple.ui.positive.message', [

                    div('.ui.grid', [
                        div('.two.column.row', [
                            div('.left.floated.column', [div('.header', ['Set wurde erfolgreich eingefügt'])]),
                            div('.right.floated.column', [button('.ui.green.button.right.floated', ['anzeigen'])])
                        ])
                    ])

                ]),
                div('.ui.three.column.doubling.stackable.grid',
                    vtree
                )
            ])
        ),
        HTTP: refreshList$
    };

    return sinks;
}