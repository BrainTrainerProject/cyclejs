import { Utils } from '../../Utils';

export interface ImportSetProps {
    setId: string;
    reqId?: string;
}

export class ImportSetApi {

    public static readonly ID: string = 'import-set';

    public static buildRequest(props: ImportSetProps): object {

        const requestUrl = '/set/' + props.setId + '/import';

        return {
            url: Utils.apiUrl(requestUrl),
            method: 'GET',
            category: (props.reqId) ? props.reqId : ImportSetApi.ID,
            type: 'application/json'
        };

    }

}
