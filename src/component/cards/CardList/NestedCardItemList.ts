import { Reducer, Sinks, Sources, State } from "../../../common/interfaces";
import { CardItem } from "./CardItem";
import Collection from "@cycle/collection";
import { StateSource } from "cycle-onionify";
import xs, { Stream } from "xstream";
import { div, p } from "@cycle/dom";
import { GetNotecardApi, GetNotecardProps } from "../../../common/api/GetNotecard";
import { NestedCardItem } from "./NestedCardItem";
import delay from "xstream/extra/delay";
import flattenSequentially from "xstream/extra/flattenSequentially";
import flattenConcurrently from "xstream/extra/flattenConcurrently";

type NestedCardItemListSources = Sources & { onion: StateSource<NestedCardItemListState> };
type NestedCardItemListSinks = Sinks & { onion: Stream<Reducer> };
interface NestedCardItemListState extends State {
}

export const ID_GET_CARDS = 'get_nested_request';

export interface NestedCardItemListProps {
    apiCalls: string[]
}

export default function NestedCardItemList(sources: NestedCardItemListSources, props: NestedCardItemListProps): NestedCardItemListSinks {

    const {DOM, HTTP} = sources;
    const regex = new RegExp('/^get-notecard-by-id*/i');

    const addNotecards$ = sources.HTTP.select()
        .compose(flattenConcurrently)
        .filter(res => {
        console.log(res);
        return res.request.category.substr(0, GetNotecardApi.ID.length) === GetNotecardApi.ID
        })
        .map(res => {
            console.log("MRES");
            console.log();
            return res;
        })
        .map(({text}) => JSON.parse(text))
        .map(item => {
            console.log("ITTTEEEMMMM");
            console.log(item);
            return ({
                id: item._id,
                props: {
                    ...item
                }
            })
        });

    console.log("CALLS", props.apiCalls);

    const notecardsRequests$ = xs.fromArray(props.apiCalls)
        .map(id => GetNotecardApi.buildRequest({
            id: id,
            requestId: id
        } as GetNotecardProps))

    const lessonSets$ = Collection(NestedCardItem, sources, addNotecards$);
    const lessonsListView$ = Collection.pluck(lessonSets$, item => item.DOM);
    //const lessonsListRouter$ = Collection.pluck(lessonSets$, item => item.router);
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
        HTTP: notecardsRequests$,
        router: lessonsListRouter$
    };

    return sinks;
}