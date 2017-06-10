import { CRUDType } from "../CRUDType";
import { Visibility } from "../Visibility";
import { Util } from "../Util";

export interface PostNotecardProps {
    type: CRUDType.ADD;
    title: string;
    description: string;
    tags: string;
    visibility: Visibility.PRIVATE;
}


export class PostNotecardApi {

    public static readonly ID: string = 'post-notecard';

    public static buildRequest(props: PostNotecardProps) {
        return {
            url: Util.apiUrl('/echo'),
            method: 'POST',
            category: PostNotecardApi.ID,
            send: props
        };
    }
}