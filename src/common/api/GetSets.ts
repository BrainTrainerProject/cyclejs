import { Utils } from "../Utils";

interface GetSetsProps {
}

export class GetSetsApi {

    static readonly ID: string = 'get-sets';

    static buildRequest() {
        return {
            url: Utils.apiUrl('/set'),
            method: 'GET',
            category: GetSetsApi.ID,
            type: 'application/json'
        };
    }

}
