import { Utils } from "../../Utils";

export interface UpdateSetProps {
    id: string,
    send: {
        title: string;
        description: string;
        tags: string;
        visibility: boolean;
        photourl: string
    }
}


export class UpdateSetApi {

    public static readonly ID: string = 'update-set';

    public static buildRequest(props: UpdateSetProps) {
        return {
            url: Utils.apiUrl('/set/' + props.id),
            method: 'PUT',
            category: UpdateSetApi.ID,
            send: props.send
        };
    }
}