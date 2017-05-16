import {br, button, div, DOMSource} from "@cycle/dom";
import {Stream} from "xstream";
import {VNode} from "snabbdom/vnode";
import {Sinks as MainSinks} from "../../main";
import {ElectronPopup, execOnElectron, isElectron} from "../../common/ElectronBridge";
import {h} from "snabbdom/h";

export type Sources = {
    DOM: DOMSource,
};
export type Sinks = {
    DOM: Stream<VNode>,
};

function intent(dom) {
    return {
        click$: dom.select('.center-content').events('click'),
        clickPopup$: dom.select('.electron-popup').events('click')
    };
}

var count = 0;

function model(intent) {

    return {
        click$: intent.clickPopup$.map(stream => {

            if (isElectron()) {
                execOnElectron({
                    type: 'popup',
                    data: {
                        lectionId: count++
                    }
                } as ElectronPopup);
            }

            return stream;
        }).startWith('')

    }
}

function view(model) {
    return model.click$.map(j => {

        const electronBtn = (isElectron()) ? button('.electron-popup', ['Popup anzeigen (nur von Electron sichtbar)']) : null;

        return div([
            button('.center-content', ['Center Knopf']),
            h('br'),
            h('br'),
            h('br'),
            h('br'),
            electronBtn
        ])
    })
}

function CenterContent(sources: Sources): MainSinks {

    const intents = intent(sources.DOM);
    const models = model(intents);
    const view$ = view(models);

    return {DOM: view$}
}

export default CenterContent;