import { div } from "@cycle/dom";
import xs from 'xstream';

export default function NotFoundPage(sources){

    return{
        DOM: xs.of(div(['ERROR 404']))
    }
}