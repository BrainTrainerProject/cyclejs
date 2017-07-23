import xs, { Stream } from 'xstream';
import { div, DOMSource, i, img } from '@cycle/dom';
import { StateSource } from 'cycle-onionify';
import { ProfileEntity } from "../../common/model/Profile";
import { StateListItemSinks, StateListItemSources } from "../lists/StateListItem";
import { Utils } from "../../common/Utils";

const ID_PROFILE = '.profile-clicked';

export interface State {
    id: string;
    profile: ProfileEntity;
    rating: number;
    comment: string;
    createDate: Date;
}

export type Reducer = (prev?: State) => State | undefined;

export type Sources = {
    DOM: DOMSource;
    onion: StateSource<State>;
};

export function FeedItem(sources: StateListItemSources): StateListItemSinks {

    const state$ = sources.onion.state$;

    const actions = intent(sources);
    const reducer = model(actions, state$);

    const vdom$ = cardView(state$);

    return {
        DOM: vdom$,
        HTTP: xs.never(),
        reducer: xs.never(),
        callback$: reducer.callback$
    };

}

function intent(sources: any): any {

    const profileClick$ = sources.DOM.select(ID_PROFILE).events('click')
        .map(e => e.preventDefault());

    return {profileClick$};
}

function model(actions: any, state$: Stream<any>): any {

    const profileClick$ = actions.profileClick$
        .mapTo(state$)
        .flatten()
        .map(state => {
                return ({
                    type: 'click-profile',
                    item: state.item
                });
            }
        );

    return {
        callback$: xs.merge(profileClick$)
    };

}

function cardView(state$: Stream<any>): any {
    return state$.map(state => {

        const item = state.item;
        const owner = item.owner;
        const sender = item.sender;
        const type = item.activityType;
        console.log(state);

        return div('.sixteen.wide.column', [
            div('.ui.middle.aligned.divided.list', [
                div('.item', [

                    div('.right.floated.content', [
                        div('.ui', {
                            'style': {
                                'name': 'style',
                                'value': 'padding: .75em 0 .25em .5em;'
                            }
                        }, [])
                    ]),
                    div('.ui.horizontal.list', [
                        div('.item', [
                            img('.ui.mini.circular.image', {
                                'attrs': {
                                    'src': Utils.imageOrPlaceHolder(sender.photourl),
                                }
                            }),
                            div('.content', [
                                div('.ui.sub.header', [sender.email])
                            ])
                        ]),
                        div('.item', [
                            i('.right.angle.icon.divider')
                        ]),
                        div('.item', [
                            prettyFeedType(type)
                        ])
                    ]),
                ])
            ])
        ])

    });
}

function prettyFeedType(type: string): string {

    switch (type) {
        case 'set_new':
            return 'Neues Set';
        default :
            return '-';
    }

}