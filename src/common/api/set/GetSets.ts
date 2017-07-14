import { Utils } from "../../Utils";

interface GetSetsProps {
    setId?: string;
    reqId?: string;
}

export class GetSetsApi {

    static readonly ID: string = 'get-sets';

    static buildRequest(props?: GetSetsProps) {

        const requestUrl = '/set';

        if(props && props.setId){
            requestUrl.concat('/');
            requestUrl.concat(props.setId);
        }

        return {
            url: Utils.apiUrl(requestUrl),
            method: 'GET',
            category: GetSetsApi.ID,
            type: 'application/json'
        };
    }

}
