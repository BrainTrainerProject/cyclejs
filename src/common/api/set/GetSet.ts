import { Utils } from "../../Utils";

export interface GetSetProps {
    id: string,
    requestId?: string,
}

export class GetSetApi {

    static readonly ID: string = 'get-set-by-id';

    static buildRequest(props: GetSetProps) {
        return {
            url: Utils.apiUrl('/set/' + props.id),
            method: 'GET',
            category: GetSetApi.ID.concat(props.requestId ? props.requestId : ''),
            type: 'application/json'
        };
    }

}
