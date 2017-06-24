import xs from 'xstream';
import { SetPageState } from './SetPage';
import { Utils } from '../../../common/Utils';
import { ModalAction } from 'cyclejs-modal';
import NotecardForm from '../../form/Notecard/Notecard';
import { GetPracticeApi, GetPracticeProps } from '../../../common/api/GetPractice';

export function model(action: any, state$) {

    const sinks = {
        onion: reducer(action),
        HTTP: httpRequests(action),
        modal: modalRequests(action, state$)
    };

    return sinks;

}

function modalRequests(action: any, state$): any {
    const newNotecardOpenModal$ = action.newNotecardClicked$
        .mapTo(state$.map(state => state.set.id))
        .flatten()
        .take(1)
        .map(id => ({
            type: 'open',
            props: {
                title: 'Notecard erstellen',
                refSet: id
            },
            component: NotecardForm
        } as ModalAction)).debug('OpenModal');

    return xs.merge(newNotecardOpenModal$);
}

function httpRequests(action: any) {

    const requestRandomNotecard$ = action.randomNotecardClicked$
        .mapTo(GetPracticeApi.buildRequest({requestId: ''} as GetPracticeProps));


    return xs.merge(requestRandomNotecard$, action.requestSetInfo$);

}

function reducer(action: any) {

    const initReducer$ = xs.of(function initReducer(state) {
        return {
            set: {
                id: '',
                title: '',
                description: '',
                image: Utils.imageOrPlaceHolder(null),
                notecards: []
            },
            rating: {
                comment: '',
                rating: 1
            },
            loading: true
        } as SetPageState;
    });

    const ratingInputReducer$ = action.inputRatingComment$
        .map(comment => function ratingInputReducer(state) {
            return {
                ...state,
                rating: {
                    ...state.rating,
                    comment: comment
                }
            };
        });

    const loadSetInfoReducer$ = action.responseSetInfo$
        .filter(response => response.ok)
        .map(response => JSON.parse(response.text))
        .map(set => function loadSetInfoReducer(state) {
            console.log('LOAD: ', set);
            return {
                ...state,
                set: {
                    ...state.set,
                    id: set._id,
                    title: set.title,
                    description: set.description,
                    image: Utils.imageOrPlaceHolder(set.photourl),
                    notecards: set.notecard
                }
            };
        }).debug('RESPONSE');

    return xs.merge(
        initReducer$,
        ratingInputReducer$,
        loadSetInfoReducer$
    );

}