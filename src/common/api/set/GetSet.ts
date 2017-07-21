import {Utils} from '../../Utils';
import {Sources} from '../../interfaces';
import {Stream} from 'xstream';
import {createGetRequestOld, flattenResponse} from '../ApiHelper';

export class GetSetApi {

    public static readonly ID: string = 'get-set-by-id';

    public static request(setId: string, reqId?: string): object {
        return createGetRequestOld(GetSetApi.ID, '/set/' + setId, reqId);
    }

    public static response(sources: Sources, reqId?: string): Stream<any> {
        return flattenResponse(sources, GetSetApi.ID, reqId);
    }

}
