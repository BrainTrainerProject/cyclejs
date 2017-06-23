import {Utils} from '../Utils';
import {isNullOrUndefined} from 'util';

export interface GetPracticeProps {
    requestId?: string;
}

interface HttpJsonGetRequest {
    url: string;
    method: 'GET';
    category: string;
    type: 'application/json';
}

export class GetPracticeApi {

    public static readonly ID: string = 'get-practice';

    public static buildRequest(props: GetPracticeProps): HttpJsonGetRequest {
        return {
            url: Utils.apiUrl('/practice/'),
            method: 'GET',
            category: GetPracticeApi.ID.concat((!isNullOrUndefined(props.requestId)) ? props.requestId : ''),
            type: 'application/json'
        };
    }

}
