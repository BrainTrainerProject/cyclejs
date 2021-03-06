import { br, div, img, span } from "@cycle/dom";
import { AppSources } from "../../../app";
import xs from "xstream";

const jwt = require("jwt-decode");

export default function UnderConstructionPage(sources: AppSources): any {

    const leftView$ = xs.of(cunstructionView());
    const rightView$ = xs.of(div());

    return {
        DOM_LEFT: leftView$,
        DOM_RIGHT: rightView$
    };
}

function cunstructionView() {
    return div('.construction', {
        props: {
            style: 'text-align:center;'
        }
    }, [img('.construction-image', {
        props: {
            src: 'http://i.imgur.com/322D84i.jpg'
        }
    }), br(), br(), br(),
        span({props: {style: 'font-size:24px;'}}, [window.location.pathname])])
}