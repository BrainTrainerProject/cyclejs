import {createGetRequestOld, flattenResponse} from '../ApiHelper';
import {Sources} from '../../interfaces';
import {Stream} from 'xstream';

export class GetSetsApi {

    public static readonly ID: string = 'get-sets';

    public static request(setId: string, reqId?: string): object {
        return createGetRequestOld(GetSetsApi.ID, '/set/' + setId, reqId);
    }

    public static response(sources: Sources, reqId?: string): Stream<any> {
        return flattenResponse(sources, GetSetsApi.ID, reqId)
            .map(({text}) => JSON.parse(text));
    }

}
