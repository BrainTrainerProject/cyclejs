import { AppSources } from "../../../app";
import xs from "xstream";
import { ID_RATING_FORM } from "./SetPage";
import { GetSetApi } from "../../../common/api/GetSet";

const Route = require('route-parser');

export function intent(sources: AppSources) {

    const {DOM, HTTP, router} = sources;

    const route$ = router.history$;

    const getSetId$ = route$
        .map(v => v.pathname)
        .map(path => {
            const route = new Route('/set/:id');
            return route.match(path)
        });

    const httpRequestSetInfo$ = getSetId$.map(route => {
        return GetSetApi.buildRequest({
            id:route.id
        })
    });

    const httpResponseSetInfo$ = HTTP.select(GetSetApi.ID).flatten().startWith(null).filter(r=> !!r).debug('RESPONSE');

    return {
        newNotecardClicked$: xs.never(),
        randomNotecardClicked$: xs.never(),
        editNotecardClicked$: xs.never(),
        setStars$: xs.never(),
        submitRating$: xs.never(),
        inputRatingComment$: DOM.select(ID_RATING_FORM).events('input').map(ev => (ev.target as HTMLInputElement).value || ''),
        requestSetInfo$: httpRequestSetInfo$,
        responseSetInfo$: httpResponseSetInfo$ || xs.never(),
        loadComments$: xs.never(),
        loadNotecards$: xs.never()
    };

}