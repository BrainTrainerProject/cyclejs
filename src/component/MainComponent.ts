import xs, {Stream} from 'xstream';
import {a, button, div, i, img, input, span} from '@cycle/dom';
import NotecardForm from './form/NotecardForm/index';
import {VNode} from 'snabbdom/vnode';
import {ModalAction} from 'cyclejs-modal';
import {AppSinks, AppSources} from '../app';
import HomePage from './page/HomePage';

export function MainComponent(sources: AppSources): AppSinks {

    const state$ = sources.onion.state$;
    const dom = sources.DOM;

    const actions = intent(sources);
    const reducer = model(sources, actions);

    // Homepage
    const homepageSinks = HomePage(sources);

    const vdom$ = view(homepageSinks.DOM);

    const modal$ = reducer.modal;

    const sinks = {
        DOM: vdom$,
        HTTP: homepageSinks.HTTP,
        onion: xs.never(),
        modal: modal$
    };

    return sinks;
}

function intent(sources: AppSources) {

    const {DOM} = sources;

    return {
        newSetClick$: DOM.select('.new-set-btn').events('click')
    };
}

function model(sources, actions) {

    const openNotecardModal$ = actions.newSetClick$.mapTo({
        type: 'open',
        props: {
            title: 'Neues Set erstellen'
        },
        component: NotecardForm
    } as ModalAction);

    const $modal = openNotecardModal$;

    const sinks = {
        modal: $modal
    };
    return sinks;
}

function view(vdom$: Stream<VNode>) {
    return vdom$.map(notecard => div('#main-container', [
        div('#masthead.ui.container', [
            div('.ui.container.content-row-flexible', [
                div('.col-left', [
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
                                        input('.prompt', {
                                            'attributes': {
                                                'type': 'text',
                                                'placeholder': 'Search...',
                                                'className': 'prompt'
                                            }
                                        }),
                                        i('.search.link.icon', {
                                            'attributes': {
                                                'data-content': 'Search UI',
                                                'className': 'search link icon'
                                            }
                                        })
                                    ]),
                                    div('.results')
                                ])
                            ])
                        ])
                    ])
                ]),
                div('.col-right.ui.dividing.right.rail', [
                    div('.ui.secondary.menu', [
                        div('.right.menu.text.no-space-right', [
                            div('.item', [
                                a('.alarm-icon.item.right.floated', [
                                    i('.alarm.outline.icon')
                                ]),
                                div('#user.ui.pointing.dropdown.top.right', [
                                    div('.text', [
                                        img('.ui.avatar.image', {
                                            'attrs': {
                                                'src': 'https://semantic-ui.com/images/avatar/large/elliot.jpg',
                                                'alt': '',
                                                'className': 'ui avatar image'
                                            }
                                        })
                                    ]),
                                    div('.menu', [
                                        div('.item', [`Profil`]),
                                        div('.item', [`Einstellungen`]),
                                        div('.item', [`Logout`])
                                    ])
                                ])
                            ])
                        ])
                    ])
                ])
            ]),
            div('.ui.container.content-row', [
                div('.ui.secondary..menu', [
                    div('.ui.item', [
                        div('.ui.dropdown.simple', [
                            div('.text', [`File`]),
                            i('.dropdown.icon'),
                            div('.menu', [
                                div('.item', [`New`]),
                                div('.item', [
                                    span('.description', [`ctrl + o`]),
                                    `
     Open...`
                                ]),
                                div('.item', [
                                    span('.description', [`ctrl + s`]),
                                    `
     Save as...`
                                ]),
                                div('.item', [
                                    span('.description', [`ctrl + r`]),
                                    `
     Rename`
                                ]),
                                div('.item', [`Make a copy`]),
                                div('.item', [
                                    i('.folder.icon'),
                                    `
     Move to folder`
                                ]),
                                div('.item', [
                                    i('.trash.icon'),
                                    `
     Move to trash`
                                ]),
                                div('.divider'),
                                div('.item', [`Download As...`]),
                                div('.item', [
                                    i('.dropdown.icon'),
                                    `
     Publish To Web`,
                                    div('.menu', [
                                        div('.item', [`Google Docs`]),
                                        div('.item', [`Google Drive`]),
                                        div('.item', [`Dropbox`]),
                                        div('.item', [`Adobe Creative Cloud`]),
                                        div('.item', [`Private FTP`]),
                                        div('.item', [`Another Service...`])
                                    ])
                                ]),
                                div('.item', [`E-mail Collaborators`])
                            ])
                        ])
                    ]),
                    div('.right.menu', [
                        div('.item', [
                            div('.ui.dropdown', [
                                div('.text', [`File`]),
                                i('.dropdown.icon'),
                                div('.menu', [
                                    div('.item', [`New`]),
                                    div('.item', [
                                        span('.description', [`ctrl + o`]),
                                        `
     Open...`
                                    ]),
                                    div('.item', [
                                        span('.description', [`ctrl + s`]),
                                        `
     Save as...`
                                    ]),
                                    div('.item', [
                                        span('.description', [`ctrl + r`]),
                                        `
     Rename`
                                    ]),
                                    div('.item', [`Make a copy`]),
                                    div('.item', [
                                        i('.folder.icon'),
                                        `
     Move to folder`
                                    ]),
                                    div('.item', [
                                        i('.trash.icon'),
                                        `
     Move to trash`
                                    ]),
                                    div('.divider'),
                                    div('.item', [`Download As...`]),
                                    div('.item', [
                                        i('.dropdown.icon'),
                                        `
     Publish To Web`,
                                        div('.menu', [
                                            div('.item', [`Google Docs`]),
                                            div('.item', [`Google Drive`]),
                                            div('.item', [`Dropbox`]),
                                            div('.item', [`Adobe Creative Cloud`]),
                                            div('.item', [`Private FTP`]),
                                            div('.item', [`Another Service...`])
                                        ])
                                    ]),
                                    div('.item', [`E-mail Collaborators`])
                                ])
                            ])
                        ])
                    ])
                ]),
                div('.ui.divider')
            ])
        ]),
        div('#content.ui.container.content-row', [
            div('#content-right.ui.dividing.right.rail', [
                div('.ui', [
                    button('.new-set-btn.ui.primary.button', [`Neues Set erstellen`])
                ])
            ]),
            div('#content-left.left-main', [notecard])
        ])
    ]));
}