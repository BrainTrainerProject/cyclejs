import xs from 'xstream';
import {button, div} from '@cycle/dom';
import NotecardForm from '../../form/NotecardForm/index';
import {ModalAction} from 'cyclejs-modal';
import {AppSinks, AppSources} from '../../../app';
import CardItemList from '../../cards/CardList/CardItemList';
import {GetSetsApi} from '../../../common/api/GetSets';
import {PostSetApi} from '../../../common/api/PostSet';
const jwt = require('jwt-decode');

export default function StartPage(sources: AppSources): AppSinks {

    const {DOM, HTTP} = sources;

    const actions = intent(sources);
    const reducer = model(actions);

    const refreshList$ = xs.of(GetSetsApi.buildRequest());

    // Cards
    const getSetsSinks = CardItemList(sources, {
        showRating: true,
        showImport: false,
        requestId: GetSetsApi.ID
    });


    const showNewSetMessage$ = HTTP
        .select(PostSetApi.ID)
        .flatten()
        .filter(response => response.ok)
        .map(res => ({
            type: 'response',
            id: res.body._id,
            title: res.body.title
        })).startWith(null);

    const leftView$ = xs.combine(showNewSetMessage$, getSetsSinks.DOM).map(leftView);
    const rightView$ = xs.of(contentRight());

    const routeNewSetClick$ = DOM.select('.route-new-set').events('click');

    const routeNewSetAdded$ = xs.combine(showNewSetMessage$, routeNewSetClick$)
        .map(([response, click]) => response.id)
        .filter(id => id !== null)
        .map(id => '/set/' + id)

    const sinks = {
        DOM_LEFT: leftView$,
        DOM_RIGHT: rightView$,
        HTTP: xs.merge(getSetsSinks.HTTP || xs.empty(), refreshList$),
        modal: reducer.modal,
        onion: getSetsSinks.onion,
        router: xs.merge(getSetsSinks.router, routeNewSetAdded$)
    };

    return sinks;
}

function leftView([setAdded, setsList]) {

    console.log('LeftView');
    console.log(setAdded);

    return div([
        (!!setAdded) ? div('.simple.ui.positive.message', [
            div('.ui.grid', [
                div('.two.column.row', [
                    div('.left.floated.column', [div('.header', ['Set "' + setAdded.title + '" wurde erfolgreich eingefügt'])]),
                    div('.right.floated.column', [button('.route-new-set.ui.green.button.right.floated', ['anzeigen'])])
                ])
            ])

        ]) : null,
        setsList
    ]);

}

function intent(sources: AppSources) {

    const {DOM} = sources;

    return {
        newSetClick$: DOM.select('.new-set-btn').events('click')
    };
}

function model(actions) {

    const openNotecardModal$ = actions.newSetClick$.mapTo({
        type: 'open',
        props: {
            title: 'Neues Set erstellen'
        },
        component: NotecardForm
    } as ModalAction);

    const $modal = openNotecardModal$;

    const sinks = {
        modal: $modal
    };
    return sinks;
}

function contentRight() {
    return div('.ui', [
        button('.new-set-btn.ui.primary.button', [`Neues Set erstellen`])
    ]);
}