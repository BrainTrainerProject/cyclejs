import { Utils } from "../../Utils";

export interface DeleteSetProps {
    id: string,
    requestId?: string,
}

export class DeleteSetApi {

    static readonly ID: string = 'delete-set-by-id';

    static buildRequest(props: DeleteSetProps) {
        return {
            url: Utils.apiUrl('/set/' + props.id),
            method: 'DELETE',
            category: DeleteSetApi.ID.concat(props.requestId ? props.requestId : ''),
            type: 'application/json'
        };
    }

}
