import { a, br, button, div, i, img, input, span } from "@cycle/dom";
import NotecardForm from "../../form/NotecardForm/index";
import { VNode } from "snabbdom/vnode";
import { ModalAction } from "cyclejs-modal";
import { AppSinks, AppSources } from "../../../app";
import MainLayout from "../../layout/MainLayout";
import xs from 'xstream'
import CardView from "../../CardView/index";
const jwt = require("jwt-decode");

export default function UnderConstructionPage(sources: AppSources): AppSinks {

    const leftView$ = xs.of(cunstructionView());
    const rightView$ = xs.of(div());

    const sinks = {
        DOM_LEFT: leftView$,
        DOM_RIGHT: rightView$
    };

    return sinks;
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
    }), br(),br(),br(),
    span({props:{style:'font-size:24px;'}},[window.location.pathname])])
}