import {Utils} from '../Utils';
import {Sources} from '../interfaces';
import {Stream} from 'xstream';

function defaultRequest(id: string, url: string, reqId?: string): object {
    return {
        url: Utils.apiUrl(url),
        category: (reqId) ? reqId : id
    };
}

export function createGetRequest(id: string, url: string, reqId?: string): object {
    return {
        ...defaultRequest(id, url, reqId),
        method: 'GET',
        type: 'application/json'
    };
}

export function createGetRequest2(url: string, reqId?: string): object {
    return {
        url: Utils.apiUrl(url),
        category: reqId,
        method: 'GET',
        type: 'application/json'
    };
}

export function createPostRequest(id: string, url: string, sendJson: object, reqId?: string): object {
    return {
        ...defaultRequest(id, url, reqId),
        method: 'POST',
        send: sendJson
    };
}

export function createPutRequest(id: string, url: string, sendJson: object, reqId?: string): object {
    return {
        ...defaultRequest(id, url, reqId),
        method: 'PUT',
        send: sendJson
    };
}

export function createDeleteRequest(id: string, url: string, reqId?: string): object {
    return {
        ...defaultRequest(id, url, reqId),
        method: 'DELETE',
        type: 'application/json'
    };
}

export function rawResponse(source: Sources, id: string, reqId?: string): Stream<any> {
    return source.HTTP.select((reqId) ? reqId : id);
}

export function flattenResponse(source: Sources, id: string, reqId?: string): Stream<any> {
    return rawResponse(source, id, reqId).flatten();
}
