import xs from "xstream";
import { ModalAction } from "cyclejs-modal";
import { CreateSetFormAction, SetForm } from "../../form/Set/SetForm";

export function model(action: any) {

    const openCreateSetModal$ = action.createSet$.mapTo({
        type: 'open',
        props: {
            title: 'Set erstellen',
            action: {
                type: 'create',
            } as CreateSetFormAction
        },
        component: SetForm
    } as ModalAction);


    const reducerActions$ = reducer(action);
    const modalActions$ = openCreateSetModal$;

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