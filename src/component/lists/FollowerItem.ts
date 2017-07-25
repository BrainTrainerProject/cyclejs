import xs, { Stream } from 'xstream';
import { a, div, DOMSource, img } from '@cycle/dom';
import { StateSource } from 'cycle-onionify';
import { ProfileEntity } from "../../common/model/Profile";
import { StateListItemSinks, StateListItemSources } from "../lists/StateListItem";
import { Utils } from "../../common/Utils";
import sampleCombine  from "xstream/extra/sampleCombine";

const ID_PROFILE = '.follower-item-profile-clicked';
const ID_ABO = '.follower-item-abo-clicked';

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

export function FollowerItem(sources: StateListItemSources): StateListItemSinks {

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

    const aboClick$ = sources.DOM.select(ID_ABO).events('click')
        .map(e => e.preventDefault());

    return {profileClick$, aboClick$};
}

function model(actions: any, state$: Stream<any>): any {

    const profileClick$ = actions.profileClick$
        .compose(sampleCombine(state$))
        .map(([evnt, state]) => ({
            type: 'click-profile',
            item: state.item
        }));

    const aboClick$ = actions.aboClick$
        .compose(sampleCombine(state$))
        .map(([evnt, state]) => ({
            type: 'click-abo',
            item: state.item
        }));

    return {
        callback$: xs.merge(profileClick$, aboClick$)
    };

}

function cardView(state$: Stream<any>): any {
    return state$.map(state => {

        const item = state.item;
        console.log('FollowerItem view: ', state);

        return div('.item', {
            attrs: {
                style: 'border:none !important; padding-bottom: 1em;'
            }
        }, [
            div('.right.floated.content', [
                div(ID_ABO + '.ui.tiny.button', [`abonnieren`])
            ]),
            img('.ui.avatar.image', {
                attrs: {
                    src: Utils.imageOrPlaceHolder(item.photourl),
                }
            }),
            div('.content', a(ID_PROFILE, [(item.name) ? item.name : item.email]))
        ])

    });
}