import xs, { Stream } from "xstream";
import { Reducer, Sinks, Sources, State } from "../../../common/interfaces";
import { AppState } from "../../../app";
import { StateSource } from "cycle-onionify";
import { a, div, img, p } from "@cycle/dom";
import { GetFeedsApi, GetFeedsApiProps } from "../../../common/api/GetFeeds";
import Collection from "@cycle/collection";

export type FeedPageSources = Sources & { onion: StateSource<AppState>, filter: any };
export type FeedPageSinks = Sinks & { onion: Stream<Reducer>, modal: Stream<any>, filter: Stream<any> };
export interface FeedPageState extends State {
}

export default function FeedPage(sources) {


    const feedListSinks = FeedItemList(sources);

    // TODO stopped here
    // next step einfach die daten für den Feed laden
    return {
        DOM_LEFT: xs.combine(xs.of(div(['DUMP'])), feedListSinks.DOM),
        DOM_RIGHT: xs.of([]),
        HTTP: xs.of(GetFeedsApi.buildRequest({page: 1} as GetFeedsApiProps))
    }
}

function leftView([dump, list]){

    return [
        div([dump]),
        list
    ]

}

export interface FeedItemProps {
    feedType: string,
    sender: {
        id: string,
        name: string,
        image: string,
    }
}

function FeedItem(sources) {

    const {DOM, props$} = sources;

    return {
        DOM: props$.map(feed => {
            return view({} as FeedItemProps)
        })
    };

}

function view(props: FeedItemProps) {
    return div(".column", [
        div(".ui.card.fluid", [
            a(".card-cover.image", {
                "attrs": {
                    "href": '/profile/' + props.sender.id
                }
            }, [
                img({
                    "attrs": {
                        "src": props.sender.image
                    }
                })
            ]),
            div(".card-title.content", [
                a(".header", {
                    "attrs": {
                        "href": '/profile/' + props.sender.id
                    }
                }, [props.sender.name])
            ])
        ])
    ])
}

function FeedItemList(sources) {

    const {DOM, HTTP} = sources;

    const feedState$ = sources.HTTP.select(GetFeedsApi.ID)
        .flatten()
        .map(({text}) => JSON.parse(text))
        .map(items => Object.keys(items)
            .map(key => items[key])
            .map(item => ({
                id: item._id,
                props: {
                    ...item
                }
            })))
        .startWith([]);

    const feedCollection$ = Collection.gather(FeedItem, sources, feedState$, 'id', key => `${key}$`);
    const feedCollectionVTree$ = Collection.pluck(feedCollection$, item => item.DOM);
    const feedCollectionRouter$ = Collection.merge(feedCollection$, item => item.router);

    const sinks = {
        DOM: feedCollectionVTree$
            .map(vtree => {

                const list = (vtree.length === 0) ?
                    div('.ui.column', p(['Keine Feeds vorhanden']))
                    : vtree;

                return div('.ui.three.column.doubling.stackable.grid',
                    list
                )
            }),
        router: feedCollectionRouter$
    };

    return sinks;
}