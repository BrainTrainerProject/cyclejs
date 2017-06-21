import { Utils } from "../Utils";

interface GetSetProps {
    id: string
}

export class GetSetApi {

    static readonly ID: string = 'get-set-by-id';

    static buildRequest(props: GetSetProps) {
        return {
            url: Utils.apiUrl('/set/' + props.id),
            method: 'GET',
            category: GetSetApi.ID,
            type: 'application/json'
        };
    }

}
