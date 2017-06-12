import { CRUDType } from "../CRUDType";
import { Visibility } from "../Visibility";
import { Utils } from "../Utils";

export interface PostSetProps {
    type: CRUDType.ADD;
    title: string;
    description: string;
    tags: string;
    visibility: Visibility.PRIVATE;
}


export class PostSetApi {

    public static readonly ID: string = 'post-notecard';

    public static buildRequest(props: PostSetProps) {
        return {
            url: Utils.apiUrl('/echo'),
            method: 'POST',
            category: PostSetApi.ID,
            send: props
        };
    }
}