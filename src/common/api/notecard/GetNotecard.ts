import {Utils} from '../../Utils';

export interface GetNotecardProps {
    id: string,
    requestId?: string
}

export class GetNotecardApi {

    static readonly ID: string = 'get-notecard-by-id';

    static buildRequest(props: GetNotecardProps) {
        return {
            url: Utils.apiUrl('/notecard/' + props.id),
            method: 'GET',
            category: GetNotecardApi.ID.concat((props.requestId != null) ? props.requestId : ''),
            type: 'application/json'
        };
    }

}
