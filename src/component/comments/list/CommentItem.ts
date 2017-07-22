import xs, { Stream } from 'xstream';
import { div, DOMSource, i, img, p, VNode } from '@cycle/dom';
import { StateSource } from 'cycle-onionify';
import { ProfileEntity } from "../../../common/model/Profile";
import { prettyTimeStamp } from "../../../common/GuiUtils";
import { Rating } from "../../../common/ui/Rating";

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

export type Sinks = {
    DOM: Stream<VNode>;
    callback$: Stream<any>;
};

export function CommentItem(sources: Sources): Sinks {

    const state$ = sources.onion.state$;

    const actions = intent(sources);
    const reducer = model(actions, state$);

    const vdom$ = cardView(state$);

    return {
        DOM: vdom$,
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

        const item = state.item as State;
        const profile = item.profile as ProfileEntity;

        return div('.sixteen.wide.column', [
            div('.ui.middle.aligned.divided.list', [
                div('.item', [
                    div('.ui.divider'),
                    div('.right.floated.content', [
                        div('.ui', {
                            'style': {
                                'name': 'style',
                                'value': 'padding: .75em 0 .25em .5em;'
                            }
                        }, [prettyTimeStamp(item.createDate)])
                    ]),
                    div('.ui.horizontal.list', [
                        div('.item', [
                            img('.ui.mini.circular.image', {
                                'attrs': {
                                    'src': profile.photourl,
                                }
                            }),
                            div('.content', [
                                div('.ui.sub.header', [profile.email])
                            ])
                        ]),
                        div('.item', [
                            i('.right.angle.icon.divider')
                        ]),
                        div('.item', [
                            Rating(item.rating)
                        ])
                    ]),
                    div('.ui.justified.container', {
                        'style': {
                            'name': 'style',
                            'value': 'font-size: 14px !important; padding-top: 15px; !important'
                        }
                    }, [
                        p([item.comment])
                    ])
                ])
            ])
        ])

    });
}