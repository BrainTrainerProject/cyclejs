import {VNode} from 'snabbdom/vnode';
import {div, i, img, span} from '@cycle/dom';

export interface DefaultViewProps {
    title: string;
}

export function defaultView(props: DefaultViewProps): VNode {

    return div('.column', [
        div('.ui.fluid.card', [
            div('.content', [
                div('.right.floated.meta', [`14h`]),
                img('.ui.avatar.image', {
                    'attrs': {
                        'src': 'https://semantic-ui.com/images/avatar/large/elliot.jpg',
                        'className': 'ui avatar image'
                    }
                }),
                props.title
            ]),
            div('.blurring.dimmable.image', [
                div('.ui.dimmer', [
                    div('.content', [
                        div('.center', [
                            div('.ui.inverted.button', [`Add Friend`])
                        ])
                    ])
                ]),
                img({
                    'attrs': {
                        'src': 'https://pbs.twimg.com/profile_images/1418282604/EnglishTwitterAvatar.jpg'
                    }
                })
            ]),
            div('.content', [
                span('.right.floated', [
                    i('.heart.outline.like.icon'),
                    `17 likes`
                ]),
                i('.comment.icon'), '3 comments'
            ])
        ])
    ]);

}