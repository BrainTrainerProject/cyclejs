import {Sinks, Sources} from '../../common/interfaces';
import {Sidebar} from './Sidebar';
import Masthead from '../masthead/Masthead';
import xs, {Stream} from 'xstream';
import {div} from '@cycle/dom';
import {VNode} from 'snabbdom/vnode';
import {mergeSinks} from 'cyclejs-utils';
import {Utils} from '../../common/Utils';
import isolate from '@cycle/isolate';
import {
    ProfileRepository,
    Request as ProfileRequest,
    RequestMethod as ProfileRequestMethod
} from '../../common/repository/ProfileRepository';
import sampleCombine from 'xstream/extra/sampleCombine';
import {PractiseModal} from '../../common/Modals';
import {Notifications} from '../../common/Notification';

const R = require('ramda');

export type MainLayoutSources = Sources & {};
export type MainLayoutSinks = Sinks & { DOM_LEFT: Stream<VNode>, DOM_RIGHT: Stream<VNode> };
export type MainLayoutComponent = (s: MainLayoutSources) => MainLayoutSinks;

export function MainLayoutWrapper(component: MainLayoutComponent): any {

    return function(sources: MainLayoutSources) {

        const sidebarSinks = Sidebar(sources);
        const mastheadSinks = isolate(Masthead, 'masthead')(sources);

        const componentSinks = component(sources);

        const vdom$ = xs.combine(sidebarSinks.DOM, mastheadSinks.DOM);

        let mergedSinks = mergeSinks(sidebarSinks, mastheadSinks, componentSinks);
        mergedSinks = Utils.filterPropsByArray(mergedSinks, ['DOM_LEFT', 'DOM_RIGHT']);

        const reducer$ = reducer(sources);

        const showPractise$ = sources.socket.get('practice_begin')
            .compose(sampleCombine(sources.router.history$))
            .map(([ev, path]) => {
                Notifications.Practise('http://localhost:8000' + path);
                return ev;
            })
            .mapTo(PractiseModal.Practise());

        const sinks = {
            ...mergedSinks,
            DOM: xs.combine(
                vdom$,
                componentSinks.DOM_LEFT || xs.never(),
                componentSinks.DOM_RIGHT || xs.never()
            ).map(view),
            HTTP: xs.merge(mergedSinks.HTTP || xs.never(), reducer$.HTTP),
            onion: xs.merge(mergedSinks.onion || xs.never(), reducer$.onion),
            modal: xs.merge(mergedSinks, showPractise$)
        };

        return sinks;
    };
}

function reducer(sources: any): any {

    // request User profile
    const profileRepository = ProfileRepository(sources, xs.of({type: ProfileRequestMethod.GET_OWN} as ProfileRequest));
    const responseGetOwnProfile$ = profileRepository.response.getOwnProfile$;

    //
    const initProfileReducer$ = xs.of(function initReducer(prev: any): any {
        return {
            ...prev,
            user: null
        };
    });
    const profileReducer$ = responseGetOwnProfile$
        .map(profile => (prevState) => {
            return {
                ...prevState,
                user: profile
            };
        });

    return {
        HTTP: xs.merge(profileRepository.HTTP),
        onion: xs.merge(initProfileReducer$, profileReducer$)
    };

}

function view([[sidebar, masthead], contentLeft, contentRight]): VNode[] {

    return [
        sidebar,
        div('#main-container', [
            masthead,
            contentView(contentLeft, contentRight)
        ])
    ];

}

function contentView(contentLeftVNode: VNode, contentRightVNode: VNode): VNode {
    return div('#content.ui.container.content-row', [
        contentRight(contentRightVNode),
        contentLeft(contentLeftVNode)
    ]);
}

function contentRight(content: VNode): VNode {
    return div('#content-right.ui.dividing.right.rail', content);
}

function contentLeft(content: VNode): VNode {
    return div('#content-left.left-main', content);
}