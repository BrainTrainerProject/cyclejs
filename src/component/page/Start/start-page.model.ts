import xs from "xstream";
import { SetFormModal } from "../../../common/Modals";

export function model(action: any) {

    const openCreateSetModal$ = action.createSet$
        .mapTo(SetFormModal.Create());

    const sinks = {
        onion: reducer(action),
        modal: openCreateSetModal$
    };

    return sinks;

}

function reducer(action: any) {

    const initReducer$ = xs.of(() => {
        return {
            setListComponent: {
                list: [],
                showRating: true,
                showImport: false
            }
        }
    });

    return xs.merge(initReducer$);
}