import {Utils} from '../Utils';
import {Sources} from '../interfaces';
import {Stream} from 'xstream';

function defaultRequestOld(id: string, url: string, reqId?: string): object {
    return {
        url: Utils.apiUrl(url),
        category: (reqId) ? reqId : id
    };
}

function defaultRequest(url: string, reqId?: string): object {

    const request = {
        url: Utils.apiUrl(url)
    };

    if (reqId) {
        request['category'] = reqId;
    }

    console.log('RETURNNNSDAD: ', request);
    return request;
}

export function createGetRequestOld(id: string, url: string, reqId?: string): object {
    return {
        ...defaultRequestOld(id, url, reqId),
        method: 'GET',
        type: 'application/json'
    };
}

export function createGetRequest(url: string, reqId?: string): object {
    return {
        ...defaultRequest(url, reqId),
        method: 'GET',
        type: 'application/json'
    };
}

export function createPostRequestOld(id: string, url: string, sendJson: object, reqId?: string): object {
    return {
        ...defaultRequestOld(id, url, reqId),
        method: 'POST',
        send: sendJson
    };
}

export function createPostRequest(url: string, sendJson: object, reqId?: string): object {
    return {
        ...defaultRequest(url, reqId),
        method: 'POST',
        send: sendJson
    };
}

export function createPutRequest(url: string, sendJson: object, reqId?: string): object {
    return {
        ...defaultRequest(url, reqId),
        method: 'PUT',
        send: sendJson
    };
}

export function createDeleteRequest(url: string, reqId?: string): object {
    return {
        ...defaultRequest(url, reqId),
        method: 'DELETE',
        type: 'application/json'
    };
}

export function createDeleteRequestOld(id: string, url: string, reqId?: string): object {
    return {
        ...defaultRequestOld(id, url, reqId),
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
