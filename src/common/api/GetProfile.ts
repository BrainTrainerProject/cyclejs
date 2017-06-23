import {Utils} from '../Utils';

export interface GetProfileProps {
    id: string;
    requestId?: string;
}

export class GetProfileApi {

    static readonly ID: string = 'get-notecard-by-id';

    static buildRequest(props: GetProfileProps) {
        return {
            url: Utils.apiUrl('/profile/' + props.id),
            method: 'GET',
            category: GetProfileApi.ID.concat((props.requestId != null) ? props.requestId : ''),
            type: 'application/json'
        };
    }

}