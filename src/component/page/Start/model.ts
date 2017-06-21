import xs from "xstream";
import { ModalAction } from "cyclejs-modal";
import NotecardForm from "../../form/Set/index";

export function model(action: any) {

    const openNotecardModal$ = action.newSetClick$.mapTo({
        type: 'open',
        props: {
            title: 'Neues Set erstellen'
        },
        component: NotecardForm
    } as ModalAction).debug('OpenModal');


    const reducerActions$ = reducer(action);
    const modalActions$ = openNotecardModal$;

    const sinks = {
        onion: reducerActions$,
        modal: modalActions$,
        HTTP: action.refreshSetList$
    };

    return sinks;

}

function reducer(action: any) {

    const initReducer$ = xs.of(function initReducer(state) {
        return {
            showNewCardMessage: false,
            newCardMessage: {}
        }
    });

    const newCardMessageReducer$ = action.newSetResponse$
        .filter(response => response.ok)
        .map(res => ({
            id: res.body._id,
            title: res.body.title
        }))
        .map(res => function cardMessageReducer(state) {
            return {
                ...state,
                showNewCardMessage: true,
                newCardMessage: {
                    id: res.id,
                    title: res.title
                }
            }
        });


    return xs.merge(initReducer$, newCardMessageReducer$);
}