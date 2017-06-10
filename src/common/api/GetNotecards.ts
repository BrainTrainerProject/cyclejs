import { Util } from "../Util";

interface GetNotecardsProps {
}

export class GetNotecardsApi {

    static readonly ID: string = 'get-notecards';

    static buildRequest() {
        return {
            url: Util.apiUrl('/notecard'),
            method: 'GET',
            category: GetNotecardsApi.ID,
            type: 'application/json'
        };
    }

}
