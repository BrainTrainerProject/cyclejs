import { CRUDType } from "./CrudType";
import { Visibility } from "./Visibility";

export interface HttpRequest {
    url: string,
    method: string,
}

interface PostNotecardBody {
    type: CRUDType.ADD,
    title: string,
    description: string,
    tags: string,
    visibility: Visibility.PRIVATE
}

export class PostNotecardApi {
    public static readonly ID = 'post-notecard'

    public static buildRequest(body: PostNotecardBody) {
        return {
            url: 'http://localhost:8080/echo',
            method: 'POST',
            category: PostNotecardApi.ID,
            send: body
        }
    }
}