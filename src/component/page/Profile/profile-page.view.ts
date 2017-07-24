import {a, div, h2, i, img, span, strong} from '@cycle/dom';

export function view() {
    return div('.ui.container', [
        div('.ui.grid', [
            profileImage(),
            profile(),
            tabs()
        ])
    ]);
}

function profileImage() {
    return div('.four.wide.column', [
        img('.ui.circular.middle.image', {
            'attrs': {
                'src': 'https://semantic-ui.com/images/avatar2/small/molly.png'
            }
        })
    ]);
}

function profile() {
    return div('.eight.wide.column', {
        'style': {
            'name': 'style',
            'value': 'padding-top: 1.75em'
        }
    }, [
        h2('.ui.header', [`Molly`]),
        div('.ui.list.horizontal.bulleted.', [
            div('.item', [`50 Sets`]),
            div('.item', [`1000 Notecards`]),
            div('.item', [`30 Follower`])
        ]),
        div('.ui.divider.hidden'),
        div('.ui.left.labeled.button', {
            'attrs': {
                'tabindex': '0'
            }
        }, [
            a('.ui.basic.right.pointing.red.label', ['2,048']),
            div('.ui.red.button', [
                i('.heart.icon'), 'abbonieren'
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

function tabs() {
    return div('.sixteen.wide.column', [
        div('.ui.pointing.secondary.menu', [

            tabItem('.active.item', 'tab-feed', 'Feed'),
            tabItem('.item', 'tab-sets', 'Sets'),
            tabItem('.item', 'tab-follower', 'Follower'),

        ]),
        feed(),
        sets(),
        follower()
    ]);
}

function feed() {
    return div('.ui.active.tab', {
        'attrs': {
            'data-tab': 'tab-feed',
            'className': 'ui active tab'
        }
    }, [
        div('.ui.middle.aligned.divided.list', [
            div('.item', [
                div('.ui.hidden.divider'),
                div('.right.floated.content', [
                    div('.ui', {
                        'attrs': {
                            'className': 'ui'
                        },
                        'style': {
                            'name': 'style',
                            'value': 'padding: .75em 0 .25em .5em;'
                        }
                    }, [`49min`])
                ]),
                div('.ui.horizontal.list', [
                    div('.item', [
                        strong([`Neue Karteikarten`])
                    ])
                ]),
                div('.ui.container', {
                    'attrs': {
                        'className': 'ui container'
                    },
                    'style': {
                        'name': 'style',
                        'value': 'font-size: 14px !important; padding-top: 15px;'
                    }
                }, [
                    div('..ui.three.column.doubling.stackable.grid', [
                        div('.column', [
                            div('.ui.fluid.card', [
                                a('.card-cover.image', {
                                    'attrs': {
                                        'href': '',
                                        'className': 'card-cover image'
                                    }
                                }, [
                                    img({
                                        'attrs': {
                                            'src': 'https://pbs.twimg.com/profile_images/1418282604/EnglishTwitterAvatar.jpg'
                                        }
                                    })
                                ]),
                                div('.card-title.content', [
                                    a('.header', {
                                        'attrs': {
                                            'href': '',
                                            'className': 'header'
                                        }
                                    }, [`Title`])
                                ]),
                                div('.extra.content', [
                                    span('.right.floated', [
                                        a({
                                            'attrs': {
                                                'href': ''
                                            }
                                        }, [
                                            i('.download.icon')
                                        ])
                                    ]),
                                    div('.ui.rating', {
                                        'attrs': {
                                            'data-rating': '3',
                                            'data-max-rating': '5',
                                            'className': 'ui rating'
                                        }
                                    }),
                                    `(42)`
                                ])
                            ])
                        ]),
                        div('.column', [
                            div('.ui.fluid.card', [
                                a('.card-cover.image', {
                                    'attrs': {
                                        'href': '',
                                        'className': 'card-cover image'
                                    }
                                }, [
                                    img({
                                        'attrs': {
                                            'src': 'https://pbs.twimg.com/profile_images/1418282604/EnglishTwitterAvatar.jpg'
                                        }
                                    })
                                ]),
                                div('.card-title.content', [
                                    a('.header', {
                                        'attrs': {
                                            'href': '',
                                            'className': 'header'
                                        }
                                    }, [`Title`])
                                ]),
                                div('.extra.content', [
                                    span('.right.floated', [
                                        a({
                                            'attrs': {
                                                'href': ''
                                            }
                                        }, [
                                            i('.download.icon')
                                        ])
                                    ]),
                                    div('.ui.rating', {
                                        'attrs': {
                                            'data-rating': '3',
                                            'data-max-rating': '5',
                                            'className': 'ui rating'
                                        }
                                    }),
                                    `(42)`
                                ])
                            ])
                        ])
                    ])
                ])
            ])
        ])
    ]);

}

function sets() {
    return div('.ui.tab', {
        'attrs': {
            'data-tab': 'tab-sets',
            'className': 'ui tab'
        }
    }, [
        div('.ui.container', {
            'attrs': {
                'className': 'ui container'
            },
            'style': {
                'name': 'style',
                'value': 'font-size: 14px !important; padding-top: 15px;'
            }
        }, [
            div('..ui.three.column.doubling.stackable.grid', [
                div('.column', [
                    div('.ui.fluid.card', [
                        a('.card-cover.image', {
                            'attrs': {
                                'href': '',
                                'className': 'card-cover image'
                            }
                        }, [
                            img({
                                'attrs': {
                                    'src': 'https://pbs.twimg.com/profile_images/1418282604/EnglishTwitterAvatar.jpg'
                                }
                            })
                        ]),
                        div('.card-title.content', [
                            a('.header', {
                                'attrs': {
                                    'href': '',
                                    'className': 'header'
                                }
                            }, [`Title`])
                        ]),
                        div('.extra.content', [
                            span('.right.floated', [
                                a({
                                    'attrs': {
                                        'href': ''
                                    }
                                }, [
                                    i('.download.icon')
                                ])
                            ]),
                            div('.ui.rating', {
                                'attrs': {
                                    'data-rating': '3',
                                    'data-max-rating': '5',
                                    'className': 'ui rating'
                                }
                            }),
                            `(42)`
                        ])
                    ])
                ]),
                div('.column', [
                    div('.ui.fluid.card', [
                        a('.card-cover.image', {
                            'attrs': {
                                'href': '',
                                'className': 'card-cover image'
                            }
                        }, [
                            img({
                                'attrs': {
                                    'src': 'https://pbs.twimg.com/profile_images/1418282604/EnglishTwitterAvatar.jpg'
                                }
                            })
                        ]),
                        div('.card-title.content', [
                            a('.header', {
                                'attrs': {
                                    'href': '',
                                    'className': 'header'
                                }
                            }, [`Title`])
                        ]),
                        div('.extra.content', [
                            span('.right.floated', [
                                a({
                                    'attrs': {
                                        'href': ''
                                    }
                                }, [
                                    i('.download.icon')
                                ])
                            ]),
                            div('.ui.rating', {
                                'attrs': {
                                    'data-rating': '3',
                                    'data-max-rating': '5',
                                    'className': 'ui rating'
                                }
                            }),
                            `(42)`
                        ])
                    ])
                ])
            ])
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
