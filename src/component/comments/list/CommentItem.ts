import xs, { Stream } from 'xstream';
import { div, i, img, p } from '@cycle/dom';
import { ProfileEntity } from "../../../common/model/Profile";
import { prettyTimeStamp } from "../../../common/GuiUtils";
import { Rating } from "../../../common/ui/Rating";
import { StateListItemSinks, StateListItemSources } from "../../lists/StateListItem";
import { Utils } from "../../../common/Utils";

const ID_PROFILE = '.profile-clicked';

export interface State {
    id: string;
    profile: ProfileEntity;
    rating: number;
    comment: string;
    createDate: Date;
    init: boolean;
}

export type Reducer = (prev?: State) => State | undefined;

function model(state$) {

    const init$ = xs.of(state$)
        .flatten()
        .map(state => () => ({
            ...state,
            item: {
                ...state.item,
                profile: {
                    photourl: Utils.imageOrPlaceHolder(''),
                },
                comment: '',
                rating: 0,
                createDate: undefined,
                init: false
            }
        }));

    return xs.merge(init$);
}

export function CommentItem(sources: StateListItemSources): StateListItemSinks {

    console.log("ITEMX")
    const state$ = sources.onion.state$.debug('COMMENT ITEMT STATE');

    const actions = intent(sources);
    const callback$ = callbackModel(actions, state$);
    const reducer$ = model(state$).debug('Comment Item Reducer!');

    const vdom$ = cardView(state$);

    return {
        DOM: vdom$,
        HTTP: xs.never(),
        reducer: reducer$,
        callback$: callback$
    };

}

function intent(sources: any): any {

    const profileClick$ = sources.DOM.select(ID_PROFILE).events('click')
        .map(e => e.preventDefault());

    return {profileClick$};
}

function callbackModel(actions: any, state$: Stream<any>): any {

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

    xs.merge(profileClick$)

}

function cardView(state$: Stream<any>): any {
    return state$
        .filter(state => !!state.init)
        .map(state => {

            const item = state.item as State;
            const profile = item.profile as ProfileEntity;

            console.log("CommentItem");
            console.log(state);

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