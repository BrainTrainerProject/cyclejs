import {CRUDType} from './CRUDType';
import {Visibility} from './Visibility';

export interface HttpRequest {
    url: string;
    method: string;
}

interface PostNotecardBody {
    type: CRUDType.ADD;
    title: string;
    description: string;
    tags: string;
    visibility: Visibility.PRIVATE;
}


export class PostNotecardApi {

    public static readonly ID : string = 'post-notecard';

    public static buildRequest(body: PostNotecardBody) {
        return {
            url: 'http://localhost:8080/echo',
            method: 'POST',
            category: PostNotecardApi.ID,
            send: body
        };
    }
}

interface GetNotecardsProps {
}

export class GetNotecardsApi {

    public static readonly ID: string = 'get-notecards';
    public static buildRequest() {
        return {
            url: 'http://localhost:8080/api/notecard',
            method: 'GET',
            category: GetNotecardsApi.ID,
            type: 'application/json'
        };
    }

}