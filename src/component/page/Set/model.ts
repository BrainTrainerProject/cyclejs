import xs from "xstream";
import { ModalAction } from "cyclejs-modal";
import NotecardForm from "../../form/Set/index";
import { SetPageState } from "./SetPage";
import { Utils } from "../../../common/Utils";

export function model(action: any) {

    const sinks = {
        onion: reducer(action),
        HTTP: action.requestSetInfo$
    };

    return sinks;

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
        } as SetPageState
    });

    const ratingInputReducer$ = action.inputRatingComment$
        .map(comment => function ratingInputReducer(state) {
            return {
                ...state,
                rating: {
                    ...state.rating,
                    comment: comment
                }
            }
        });

    const loadSetInfoReducer$ = action.responseSetInfo$
        .filter(response => response.ok)
        .map(response => JSON.parse(response.text))
        .map(set => function loadSetInfoReducer(state) {
            console.log("LOAD: ", set)
            return {
                ...state,
                set:{
                    ...state.set,
                    id: set._id,
                    title: set.title,
                    description: set.description,
                    image: Utils.imageOrPlaceHolder(set.photourl),
                    notecards: set.notecard
                }
            }
        });

    return xs.merge(
        initReducer$,
        ratingInputReducer$,
        loadSetInfoReducer$
    );

}