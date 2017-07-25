import { a, div, h2, i, img } from '@cycle/dom';
import { VNode } from "snabbdom/vnode";
import xs, { Stream } from "xstream";
import { Utils } from "../../../common/Utils";

export function view(state$, feed$, sets$): Stream<VNode> {

    return xs.combine(state$, feed$, sets$)
        .map(([state, feedList, setList]) => div('.ui.container', [

            (!state.profile) ? div(['Loading...']) :
                (state.isPrivate) ? div(['Private']) :
                    div('.ui.grid', [
                        (!!state.profile.photourl) ? profileImage(Utils.imageOrPlaceHolder(state.profile.photourl)) : null,
                        profile(state.profile),
                        tabs(feedList, setList)
                    ])
        ]));

}

function profileImage(image) {
    return div('.four.wide.column', [
        img('.ui.circular.middle.image', {
            'attrs': {
                'src': image
            }
        })
    ]);
}

function profile(profile) {
    return div('.eight.wide.column', {
        'style': {
            'name': 'style',
            'value': 'padding-top: 1.75em'
        }
    }, [
        h2('.ui.header', [(profile.name) ? profile.name : profile.email]),
        div('.ui.list.horizontal.bulleted.', [
            div('.item', [profile.setsCount + ` Sets`]),
            div('.item', [profile.notecardCount + ` Notecards`]),
            div('.item', [profile.followerCount + ` Follower`])
        ]),
        div('.ui.divider.hidden'),
        div('.ui.left.labeled.button', {
            'attrs': {
                'tabindex': '0'
            }
        }, [
            a('.ui.basic.right.pointing.red.label', [profile.followerCount]),
            div('.ui.red.button', [
                i('.heart.icon'), 'abonnieren'
            ])
        ])
    ]);
}

function tabItem(clazz, tabid, tablabel) {
    return a(clazz, {
        hook: {
            insert: ({elm}) => {
                $(elm).tab();
            }
        },
        'attrs': {
            'data-tab': tabid
        }
    }, [tablabel]);
}

function tabs(feedList, setList) {
    return div('.sixteen.wide.column', [
        div('.ui.pointing.secondary.menu', [

            tabItem('.active.item', 'tab-feed', 'Feed'),
            tabItem('.item', 'tab-sets', 'Sets'),
            tabItem('.item', 'tab-follower', 'Follower'),

        ]),
        feed(feedList),
        sets(setList),
        follower()
    ]);
}

function feed(feedList) {
    return div('.ui.active.tab', {
        'attrs': {
            'data-tab': 'tab-feed',
            'className': 'ui active tab'
        }
    }, [
        div('.ui.middle.aligned.divided.list', {attrs: {style: 'padding:10px !important;'}}, [
            feedList,
        ])
    ]);

}

function sets(setList) {
    return div('.ui.tab', {
        'attrs': {
            'data-tab': 'tab-sets',
            'className': 'ui tab'
        }
    }, [
        div('.ui.container', {
            'attrs': {
                'className': 'ui container',
                style: 'font-size: 14px !important; padding-top: 15px !important;'
            }
        }, [

            setList,

        ])
    ]);

}

function follower() {
    return div('.ui.tab', {
        'attrs': {
            'data-tab': 'tab-follower',
            'className': 'ui  tab'
        }
    }, [
        div('.ui.divider.hidden'),
        div('.ui.middle.aligned.divided.list', [
            div('.item', {
                'attrs': {
                    'className': 'item'
                },
                'style': {
                    'name': 'style',
                    'value': 'border:none !important; padding-bottom: 1em;'
                }
            }, [
                div('.right.floated.content', [
                    div('.ui.tiny.button', [`abbonieren`])
                ]),
                img('.ui.avatar.image', {
                    'attrs': {
                        'src': 'https://semantic-ui.com/images/avatar2/small/lindsay.png',
                        'className': 'ui avatar image'
                    }
                }),
                div('.content', [`Lena`])
            ]),
            div('.item', {
                'attrs': {
                    'className': 'item'
                },
                'style': {
                    'name': 'style',
                    'value': 'border:none !important;'
                }
            }, [
                div('.right.floated.content', [
                    div('.ui.tiny.button', [`abbonieren`])
                ]),
                img('.ui.avatar.image', {
                    'attrs': {
                        'src': 'https://semantic-ui.com/images/avatar2/small/lena.png',
                        'className': 'ui avatar image'
                    }
                }),
                div('.content', [`Lindsay`])
            ])
        ])
    ]);

}
