import { Utils } from "../../Utils";

interface GetNotecardsProps {
}

export class GetNotecardsApi {

    static readonly ID: string = 'get-notecards';

    static buildRequest() {
        return {
            url: Utils.apiUrl('/notecard'),
            method: 'GET',
            category: GetNotecardsApi.ID,
            type: 'application/json'
        };
    }

}
