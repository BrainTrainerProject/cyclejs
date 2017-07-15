import xs, {Stream} from 'xstream';
import {State as SetComponentState, ShowOptions, ShowOwnSets, ShowSearchedSets, ShowSpecificSets} from './SetsComponent';
import dropRepeats from 'xstream/extra/dropRepeats';
import {SearchSetsApi} from '../../../common/api/set/SearchSets';
import {GetSetsApi} from '../../../common/api/set/GetSets';
import {Sources} from '../../../common/interfaces';

export interface SetServiceSinks {
    requests: Stream<any>;
    response: ResponseSinks;
}

interface ResponseSinks {
    getSetsApi$: Stream<any>;
    searchSetsApi$: Stream<any>;
}

export function SetService(sources: Sources, state$: Stream<any>): SetServiceSinks {

    return {
        requests: requests(state$),
        response: responses(sources)
    };

}

function requests(state$: Stream<SetComponentState>): Stream<any> {

    function filterActionFromState$(type: string, compareFn: (prev: ShowOptions, now: ShowOptions) => boolean): Stream<any> {
        return state$
            .map(state => state.show as ShowOptions)
            .filter(show => show.type === type)
            .compose(dropRepeats(<SearchSetAction>(prev, now) => compareFn(prev, now)));
    }

    const searchSetRequest$ = filterActionFromState$('search',
        (prev: ShowSearchedSets, now: ShowSearchedSets) => prev.search === now.search)
        .map(state => state.search)
        .map(search => {
            return SearchSetsApi.buildRequest({
                param: encodeURIComponent(search.param),
                orderBy: search.orderBy,
                sort: search.sortBy
            });
        });

    const ownSetRequest$ = filterActionFromState$('own',
        (prev: ShowOwnSets, now: ShowOwnSets) => prev.type === now.type)
        .map(state => GetSetsApi.buildRequest());

    const specificSetRequest$ = filterActionFromState$('byId',
        (prev: ShowSpecificSets, now: ShowSpecificSets) => prev.setId === now.setId)
        .map(action => GetSetsApi.buildRequest({
            setId: action.setId
        }));

    return xs.merge(ownSetRequest$, specificSetRequest$, searchSetRequest$);
}

function responses({HTTP}: Sources): ResponseSinks {

    function responseHelper(id: string): Stream<any> {
        return HTTP.select(id)
            .flatten()
            .map(({text}) => JSON.parse(text));
    }

    const getSetsApi$ = responseHelper(GetSetsApi.ID);
    const searchSetsApi$ = responseHelper(SearchSetsApi.ID);

    return {
        getSetsApi$,
        searchSetsApi$
    };

}