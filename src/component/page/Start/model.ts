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

    const modalActions$ = openCreateSetModal$;

    const sinks = {
        onion: reducer(action),
        modal: modalActions$,
        HTTP: action.refreshSetList$
    };

    return sinks;

}

function reducer(action: any) {

    const initReducer$ = xs.of(function initReducer(state) {
        return { }
    });

    return xs.merge(initReducer$);
}