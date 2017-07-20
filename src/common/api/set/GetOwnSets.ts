import {createGetRequest, flattenResponse} from '../ApiHelper';
import {Sources} from '../../interfaces';
import {Stream} from 'xstream';

export class GetOwnSetsApi {

    public static readonly ID: string = 'get-own-sets';

    public static request(reqId?: string): object {
        return createGetRequest(GetOwnSetsApi.ID, '/set', reqId);
    }

    public static response(sources: Sources, reqId?: string): Stream<any> {
        return flattenResponse(sources, GetOwnSetsApi.ID, reqId);
    }

}
