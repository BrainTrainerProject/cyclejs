import { a, div, i, input } from '@cycle/dom';
import xs from 'xstream';
import debounce from 'xstream/extra/debounce';
import { VNode } from "snabbdom/vnode";

const Route = require('route-parser');

const ID_BREADCRUMB_START = '.br-start';

export default function MastheadSearch(sources) {

    const searchInput$ = sources.DOM.select('.prompt').events('input').map(e => e.target.value);

    const profileClick$ = sources.DOM.select('.nav-profil').events('click').mapTo('/profil');
    const settingClick$ = sources.DOM.select('.nav-setting').events('click').mapTo('/setting');
    const logoutClick$ = sources.DOM.select('.nav-logout').events('click').mapTo('/logout');
    const breadcrumbClick$ = sources.DOM.select(ID_BREADCRUMB_START).events('click').mapTo('/start');

    const route$ = xs.merge(profileClick$, settingClick$, logoutClick$, breadcrumbClick$);

    const path$ = sources.router.history$.startWith('/start').map(v => v.pathname)
    const naviReducer$ = xs.merge(
        path$.map(path => {
            const route = new Route('/:root');
            return route.match(path);
        }),
        path$.map(path => {
            const route = new Route('/:root/:id');
            return route.match(path);
        }),
    ).filter(path => (path))
        .debug('XPATH');

    const searchFilter$ = searchInput$.filter(value => value.length > 2).map(value => ({
        action: 'search',
        value: value
    })).compose(debounce(500));

    const resetFilter$ = searchInput$.filter(value => value.length <= 2).map(value => ({
        action: 'reset'
    })).compose(debounce(500));

    return {
        DOM: view(naviReducer$),
        router: route$,
        filter: xs.merge(searchFilter$, resetFilter$)
    };

}

function view(path$) {
    return path$.map(path => div('.col-left', [
        div('.ui.secondary..menu', [
            a('.launch.icon.item.menu-icon', [
                i('.content.icon')
            ]),
            div('.ui.item', [
                div('.ui.large.breadcrumb', breadCrumb(path))
            ]),
            (path.root === 'store') ? div('.right.menu.no-space-right', [
                div('.item', [
                    div('#search.ui.right.aligned.search.input', [
                        div('.ui.icon.input', [
                            input('.prompt'),
                            i('.search.link.icon')
                        ]),
                        div('.results')
                    ])
                ])
            ]) : null
        ])
    ]));
}

function breadCrumb(path): VNode[] {

    return [
        a(ID_BREADCRUMB_START + '.active.section', [`Start`]),
        (hasSecondCrumb()) ? i(".right.angle.icon.divider") : null,
        (hasSecondCrumb()) ? secondBread() : null
    ];

    function hasSecondCrumb() {
        return path.root != 'start'
    }

    function secondBread(): VNode {
        let crumb = '';

        if (path.root === 'set') crumb = 'Set';
        if (path.root === 'store') crumb = 'Store';
        if (path.root === 'profile') crumb = 'Profile';
        if (path.root === 'feed') crumb = 'Feed';

        return div(".active.section", [crumb])
    }
}