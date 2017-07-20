import {Stream} from 'xstream';
import {HttpRequest} from '../api/HttpRequest';
import {Sources} from '../interfaces';

export interface ResponseSinks {
    [name: string]: Stream<any>;
}

export interface RepositorySinks {
    HTTP: Stream<HttpRequest>;
    response: ResponseSinks;
}

export function defaultResponseHelper(sources: Sources, id: string): Stream<any> {
    return sources.HTTP.select(id)
        .flatten()
        .map(({text}) => JSON.parse(text));
}