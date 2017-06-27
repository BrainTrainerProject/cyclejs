import Collection from '@cycle/collection';
import {GetFeedsApi} from '../../../common/api/GetFeeds';
import {a, div, img, p} from '@cycle/dom';
import xs from 'xstream';
import {GetProfileApi, GetProfileProps} from '../../../common/api/profile/GetProfile';
import {isNullOrUndefined} from 'util';

export default function FeedItemList(sources) {

    const {DOM, HTTP} = sources;

    // Returns array of feed items
    const feedApiResponse$ = sources.HTTP.select(GetFeedsApi.ID)
        .flatten()
        .map(({text}) => JSON.parse(text));

    const senderRequest$ = feedApiResponse$
        .map(array => {
            return xs.fromArray(array).map(obj => {
                console.log('OBJECT', obj);
                return GetProfileApi.buildRequest({id: obj._id} as GetProfileProps);
            });
        }).flatten();

    // Priority 3
    const activityRequest$ = feedApiResponse$
        .map(array => {
            return xs.fromArray(array)
                .filter(obj => !isNullOrUndefined(getFeedType(obj.activityType)));
        })
        .flatten()
        .map(obj => {
            // Filter Type
            // Make the right request
            return obj;
        })

    const feedState$ = feedApiResponse$
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
                );
            }),
        router: feedCollectionRouter$,
        HTTP: senderRequest$
    };

    return sinks;
}

enum FeedType{
    NEW_SET, NEW_NOTECARD
}

function getFeedType(type: string): FeedType {
    switch (type) {
        case 'set_new':
            return FeedType.NEW_SET;
        default :
            undefined;
    }
}

export interface FeedItemProps {
    feedType: string;
    sender: {
        id: string,
        name: string,
        image: string
    };
}

function FeedItem(sources) {

    const {DOM, props$} = sources;

    return {
        DOM: props$.map(feed => {
            return view({} as FeedItemProps);
        })
    };

}

function view(props: FeedItemProps) {
    return div('.column', [
        div('.ui.card.fluid', [
            a('.card-cover.image', {
                'attrs': {
                    'href': '/profile/' + props.sender.id
                }
            }, [
                img({
                    'attrs': {
                        'src': props.sender.image
                    }
                })
            ]),
            div('.card-title.content', [
                a('.header', {
                    'attrs': {
                        'href': '/profile/' + props.sender.id
                    }
                }, [props.sender.name])
            ])
        ])
    ]);
}