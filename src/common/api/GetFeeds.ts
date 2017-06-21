import { Utils } from "../Utils";

export interface GetFeedsApiProps {
    page: number
}

export class GetFeedsApi {

    static readonly ID: string = 'get-feeds';

    static buildRequest(props: GetFeedsApiProps) {
        return {
            url: Utils.apiUrl('/activity/' + props.page),
            method: 'GET',
            category: GetFeedsApi.ID,
            type: 'application/json'
        };
    }

}
