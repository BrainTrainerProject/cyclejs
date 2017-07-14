import { Utils } from '../../Utils';

interface SearchSetsProps {
    param?: string;
    orderBy?: string;
    sort?: string;
    reqId?: string;
}

export class SearchSetsApi {

    static readonly ID: string = 'get-sets-search';

    static buildRequest(props: SearchSetsProps) {

        console.log('Search Sets Propts' , props);

        let url = '/set/search?';
        if (props.param) {
            console.log('Add Param');
            url += 'param=';
            url += props.param;
            console.log('Url:', url);
        }
        if (props.orderBy) {
            url.concat((props.param) ? '&orderBy=' : 'orderBy=');
            url.concat(props.orderBy);
        }
        if (props.sort) {
            url.concat((props.param) ? '&sort=' : 'sort=');
            url.concat(props.sort);
        }

        return {
            url: Utils.apiUrl(url),
            method: 'GET',
            category: SearchSetsApi.ID,
            type: 'application/json'
        };
    }

}
