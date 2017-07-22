import {Stream} from 'xstream';
import {HttpRequest} from '../api/HttpRequest';
import {Sources} from '../interfaces';

export interface RootResponseSinks {}
export interface RootRequestMethod {}
export interface RootRepositorySinks {
    HTTP: Stream<HttpRequest>;
    response: RootResponseSinks;
}

export function defaultResponseHelper(sources: Sources, id: string): Stream<any> {
    return sources.HTTP.select(id)
        .flatten()
        .map(({text}) => JSON.parse(text));
}

export function filterActionFromRequest$(action$: Stream<any>, type: RootRequestMethod): Stream<any> {
    return action$
        //.filter(action => !!action)
        .filter(action => action.type === type);
}