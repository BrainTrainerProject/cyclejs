import {Sinks, Sources} from '../../common/interfaces';
import {Sidebar} from './Sidebar';
import Masthead from '../masthead/Masthead';
import xs, {Stream} from 'xstream';
import {div} from '@cycle/dom';
import {VNode} from 'snabbdom/vnode';
import {mergeSinks} from 'cyclejs-utils';
import {Utils} from '../../common/Utils';
import isolate  from '@cycle/isolate';
import {ModalAction} from 'cyclejs-modal';
import {CreateSetFormAction, SetForm} from '../form/Set/SetForm';
import {isolateSink} from '@cycle/http/lib/isolate';
import {GetProfileApi} from '../../common/api/profile/GetProfile';
const R = require('ramda');

export type MainLayoutSources = Sources & {};
export type MainLayoutSinks = Sinks & { DOM_LEFT: Stream<VNode>, DOM_RIGHT: Stream<VNode> };
export type MainLayoutComponent = (s: MainLayoutSources) => MainLayoutSinks;

export function MainLayoutWrapper(component: MainLayoutComponent) {

    return function(sources: MainLayoutSources) {

        const sidebarSinks = Sidebar(sources);
        const mastheadSinks = isolate(Masthead, 'masthead')(sources);

        const componentSinks = component(sources);

        const vdom$ = xs.combine(sidebarSinks.DOM, mastheadSinks.DOM);

        let mergedSinks = mergeSinks(sidebarSinks, mastheadSinks, componentSinks);
        mergedSinks = Utils.filterPropsByArray(mergedSinks, ['DOM_LEFT', 'DOM_RIGHT']);

        const reducer$ = reducer(sources);

        const sinks = {
            ...mergedSinks,
            DOM: xs.combine(
                vdom$,
                componentSinks.DOM_LEFT || xs.never(),
                componentSinks.DOM_RIGHT || xs.never()
            ).map(view),
            HTTP: xs.merge(mergedSinks.HTTP || xs.never(), reducer$.HTTP),
            onion: xs.merge(mergedSinks.onion || xs.never(), reducer$.onion)
        };

        return sinks;
    };
}

function reducer({HTTP}) {

    // request User profile
    const httpRequestUserInfo$ = xs.of(GetProfileApi.buildRequest({id: '', requestId: 'userprofile'}));
    const httpResponseUserInfo$ = HTTP.select(GetProfileApi.ID + 'userprofile')
        .flatten()
        .map(({text}) => JSON.parse(text)).debug('Profile response!');

    //
    const initProfileReducer$ = xs.of(function initReducer(prev) {
        return {
            ...prev,
            user: null
        };
    });
    const profileReducer$ = httpResponseUserInfo$
        .map(profile => (prevState) => {
            return {
                ...prevState,
                user: profile
            };
        });

    return {
        HTTP: httpRequestUserInfo$,
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