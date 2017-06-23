import {Utils} from '../Utils';

export interface PostNotecardProps {
    send: {
        title: string;
        task: string;
        answer: string;
    }
    refSet?: string;
    reqId?: string;
}


export class PostNotecardApi {

    public static readonly ID: string = 'post-set';

    public static buildRequest(props: PostNotecardProps) {

        let apiUrl = '/notecard';
        apiUrl += (props.refSet) ? '/set/' + props.refSet : '';

        console.log('ApiUrl', apiUrl);
        console.log('RefId', props);

        return {
            url: Utils.apiUrl(apiUrl),
            method: 'POST',
            category: PostNotecardApi.ID.concat((props.reqId) ? props.reqId : ''),
            send: props.send
        };
    }
}