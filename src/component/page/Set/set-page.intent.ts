import {AppSources} from '../../../app';
import xs from 'xstream';
import { ID_EDIT_SET_BTN, ID_NEW_NOTECARD_BTN, ID_RANDOM_NOTECARD_BTN, ID_RATING_FORM } from './set-page';
import {GetSetApi} from '../../../common/api/set/GetSet';

const Route = require('route-parser');

export function intent(sources: AppSources) {

    const {DOM, HTTP, router} = sources;

    const route$ = router.history$;

    const newNotecardButtonClicked$ = DOM.select(ID_NEW_NOTECARD_BTN).events('click');
    const randomNotecardButtonClicked$ = DOM.select(ID_RANDOM_NOTECARD_BTN).events('click');
    const editSetButtonClicked$ = DOM.select(ID_EDIT_SET_BTN).events('click');

    const getSetId$ = route$
        .map(v => v.pathname)
        .map(path => {
            const route = new Route('/set/:id');
            return route.match(path);
        });

    const httpRequestSetInfo$ = getSetId$.map(route => {
        return GetSetApi.buildRequest({
            id: route.id
        });
    });

    const httpResponseSetInfo$ = HTTP.select(GetSetApi.ID).flatten().startWith(null).filter(r => !!r).debug('RESPONSE');

    return {
        getSetId$: getSetId$,
        createNotecard$: newNotecardButtonClicked$,
        showRandomNotecard$: randomNotecardButtonClicked$,
        editSet$: editSetButtonClicked$,

        editNotecardClicked$: xs.never(),
        inputRatingComment$: DOM.select(ID_RATING_FORM).events('input').map(ev => (ev.target as HTMLInputElement).value || ''),
        requestSetInfo$: httpRequestSetInfo$,
        responseSetInfo$: httpResponseSetInfo$ || xs.never(),
        loadComments$: xs.never(),
        loadNotecards$: xs.never()
    };

}