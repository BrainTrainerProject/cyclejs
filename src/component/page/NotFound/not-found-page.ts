import { img } from "@cycle/dom";
import xs from 'xstream';

export default function NotFoundPage(sources) {
    return {
        DOM: xs.of(img({
            props: {
                src: 'http://i.imgur.com/s85Xa.png'
            }
        }))
    }
}