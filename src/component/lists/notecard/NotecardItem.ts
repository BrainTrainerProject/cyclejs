import {Utils} from '../../../common/Utils';
import {a, div, img} from '@cycle/dom';
import xs from 'xstream';

export interface NotecardItemProps {
    title: string;
    imageUrl: string;
}

const ID_CLICK = '.click-id';

export function NotecardItem(sources) {

    console.log('Call NotecardItem');

    const {DOM, props} = sources;
    console.log(sources);

    // intent
    const cardClick$ = DOM.select('a').events('click').map(event => event.preventDefault(event));

    const clickStreams$ = cardClick$
        .mapTo(props.id)
        .map(id => console.log("ID: ", id))
        .debug('CLICKED');

    return {
        DOM: xs.of(view({
            title: props.title,
            imageUrl: Utils.imageOrPlaceHolder(props.photourl)
        } as NotecardItemProps)),
        remove$: xs.never(),
        itemClick$: clickStreams$,
        action$: clickStreams$.map(id => ({
            type: 'modal', payload: {id: id}
        }))
    };
}

function view(props: NotecardItemProps) {

    return div('.column', [
        div('.ui.card.fluid', [
            a(ID_CLICK + '.card-cover.image', {
                attrs: {
                    href: '#'
                }
            }, [
                img({
                    'attrs': {
                        'src': props.imageUrl
                    }
                })
                ]),
            div('.card-title.content', [
                a(ID_CLICK + '.header', [props.title])
            ])
        ])
    ]);

}