import { Utils } from '../../../common/Utils';
import { a, div, i, img, span } from '@cycle/dom';
import xs from 'xstream';

export interface CardItemProps {
    title: string
    imageUrl: string
    url: string
    rating: number
    ratingCount: number,
    showRating: boolean,
    showImport: boolean
}

export function NotecardItem(sources) {

    console.log("Call NotecardItem");

    const {DOM, props} = sources;

    // intent
    const cardClick$ = DOM.select('.card-cover').events('click').map(e => e.preventDefault());
    const titleClick$ = DOM.select('.card-title').events('click').map(e => e.preventDefault());

    const clickStreams$ = xs.merge(cardClick$, titleClick$)
        .map(s => props.map(set => set._id))
        .flatten();

    return {
        DOM: xs.of(view({
            title: props.title,
            imageUrl: Utils.imageOrPlaceHolder(props.photourl),
            url: '/notecard/' + props._id,
            rating: 3,
            ratingCount: 42,
            showRating: props.showRating,
            showImport: props.showImport
        } as CardItemProps)),
        remove$: xs.never(),
        itemClick$: clickStreams$.debug('CLICK ITEM')
    };
}

function view(props: CardItemProps) {


    return div('.column', [
        div('.ui.card.fluid', [
            span('.card-cover.image', {
                'attrs': {
                    'href': props.url
                }
            }, [
                img({
                    'attrs': {
                        'src': props.imageUrl
                    }
                })
            ]),
            div('.card-title.content', [
                span('.header', {
                    'attrs': {
                        'href': props.url
                    }
                }, [props.title])
            ]),
            showExtraContent(props)
        ])
    ]);
}

function showExtraContent(props: CardItemProps) {
    return (props.showImport || props.showRating) ? div('.extra.content', [

        (props.showImport) ? span('.right.floated', [
            a({
                'attrs': {
                    'href': '',
                    'stype': ''
                }
            }, [
                i('.download.icon')
            ])
        ]) : null,

        (props.showRating) ? div('ui', [div('.ui.rating', {
            'attrs': {
                'data-rating': props.rating,
                'data-max-rating': '5'
            },
            hook: {
                insert: (vnode) => {
                    $(vnode.elm).rating('disable');
                }
            }
        }),
            span('.rating-count', ['(' + props.ratingCount + ')'])
        ]) : null

    ]) : null;
}

