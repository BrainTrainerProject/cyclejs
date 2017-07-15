import {div, i} from '@cycle/dom';
import xs from 'xstream';
import {VNode} from 'snabbdom/vnode';
import {Sources} from '../../common/interfaces';
import {OrderAction, OrderTypes, SortTypes} from '../../driver/FilterDriver/index';

const ID_TITLE = '.order-title';
const ID_DATE_DESC = '.date-order-desc';
const ID_DATE_ASC = '.date-order-asc';
const ID_RATING_DESC = '.rating-order-desc';
const ID_RATING_ASC = '.rating-order-asc';

const ID_ORDER_DATE = 'date';
const ID_ORDER_RATING = 'rating';

const ID_SORT_DESC = 'desc';
const ID_SORT_ASC = 'asc';

function intent({DOM, filter}: Sources): any {

    function orderClick$(id: string): any {
        return DOM.select(id).events('click').map(e => e.preventDefault());
    }

    const orderDateDescClick$ = orderClick$(ID_DATE_DESC);
    const orderDateAscClick$ = orderClick$(ID_DATE_ASC);
    const orderRatingDescClick$ = orderClick$(ID_RATING_DESC);
    const orderRatingAscClick$ = orderClick$(ID_RATING_ASC);

    const changeOrder$ = xs.merge(orderDateDescClick$, orderDateAscClick$, orderRatingDescClick$, orderRatingAscClick$);

    return {
        filter: changeOrder$.map(e => {
            const dataset = e.target.dataset;
            return ({
                action: 'order',
                orderBy: getOrderType(dataset.orderBy),
                sortBy: getSortType(dataset.sort)
            } as OrderAction);
        })
    };
}

function getOrderType(orderBy: string): OrderTypes {
    switch (orderBy) {
        case ID_ORDER_RATING:
            return OrderTypes.RATING;
        default:
            return OrderTypes.DATE;
    }
}

function getSortType(sortBy: string): SortTypes {
    switch (sortBy) {
        case ID_SORT_DESC:
            return SortTypes.DESC;
        default:
            return SortTypes.ASC;
    }
}

export default function MastheadFilter(sources: Sources): any {

    const profileClick$ = sources.DOM.select('.nav-profil').events('click').mapTo('/profil');
    const settingClick$ = sources.DOM.select('.nav-setting').events('click').mapTo('/setting');
    const logoutClick$ = sources.DOM.select('.nav-logout').events('click').mapTo('/logout');

    const route$ = xs.merge(profileClick$, settingClick$, logoutClick$);

    return {
        DOM: xs.of(view()),
        router: route$
    };

}

function filterItem(id: string, orderBy: string, sort: string, icon: string, label: string): VNode {
    return div('.item' + id, {
        dataset: {
            sort: sort,
            orderBy: orderBy,
            label: label
        }
    }, [i(icon), label]);
}

function filterItemDown(id: string, orderBy: string, label: string): VNode {
    return filterItem(id, orderBy, ID_SORT_DESC, '.angle.down.icon', label);
}

function filterItemUp(id: string, orderBy: string, label: string): VNode {
    return filterItem(id, orderBy, ID_SORT_ASC, '.angle.up.icon', label);
}

function view(): VNode {
    return div('.ui.secondary.menu', [
        div('.right.menu', [
            div('.item', [
                div('.ui.dropdown.simple', [
                    div('.text' + ID_TITLE, [`Datum aufsteigend`]),
                    i('.dropdown.icon'),
                    div('.menu', [

                        filterItemUp(ID_DATE_ASC, ID_ORDER_DATE, 'Datum aufsteigend'),
                        filterItemDown(ID_DATE_DESC, ID_ORDER_DATE, 'Datum absteigend'),
                        filterItemUp(ID_RATING_ASC, ID_ORDER_RATING, 'Rating aufsteigend'),
                        filterItemDown(ID_RATING_DESC, ID_ORDER_RATING, 'Rating aufsteigend')

                    ])
                ])
            ])
        ])
    ]);
}