import {Utils} from '../../Utils';

export interface UpdateProfileProps {
    send: {
        "visibility": boolean,
        "cardsPerSession": number,
        "interval": number
    }
    reqId?: string;
}


export class UpdateProfileApi {

    public static readonly ID: string = 'update-profile';

    public static buildRequest(props: UpdateProfileProps) {

        return {
            url: Utils.apiUrl('/profile/'),
            method: 'PUT',
            category: UpdateProfileApi.ID.concat((props.reqId) ? props.reqId : ''),
            send: props.send
        };

    }
}