import { div } from "@cycle/dom";
import xs from 'xstream';

export default function NotFoundComponent(sources){

    return{
        DOM: xs.of(div(['ERROR 404']))
    }
}