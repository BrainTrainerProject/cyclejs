import { a, div, i, input } from '@cycle/dom';
import xs from 'xstream';
import delay from 'xstream/extra/delay';
import debounce from 'xstream/extra/debounce';

export default function MastheadSearch(sources) {

    const searchInput$ = sources.DOM.select('.prompt').events('input').map(e => e.target.value);

    const profileClick$ = sources.DOM.select('.nav-profil').events('click').mapTo('/profil');
    const settingClick$ = sources.DOM.select('.nav-setting').events('click').mapTo('/setting');
    const logoutClick$ = sources.DOM.select('.nav-logout').events('click').mapTo('/logout');

    const route$ = xs.merge(profileClick$, settingClick$, logoutClick$);

    const searchFilter$ = searchInput$.filter(value => value.length > 2).map(value => ({
        action: 'search',
        value: value
    })).compose(debounce(500));

    const resetFilter$ = searchInput$.filter(value => value.length <= 2).map(value => ({
        action: 'reset'
    })).compose(debounce(500));

    return {
        DOM: xs.of(view()),
        router: route$,
        filter: xs.merge(searchFilter$, resetFilter$)
    };

}

function view() {
    return div('.col-left', [
        div('.ui.secondary..menu', [
            a('.launch.icon.item.menu-icon', [
                i('.content.icon')
            ]),
            div('.ui.item', [
                div('.ui.large.breadcrumb', [
                    a('.active.section', [`Start`])
                ])
            ]),
            div('.right.menu.no-space-right', [
                div('.item', [
                    div('#search.ui.right.aligned.search.input', [
                        div('.ui.icon.input', [
                            input('.prompt'),
                            i('.search.link.icon')
                        ]),
                        div('.results')
                    ])
                ])
            ])
        ])
    ]);
}