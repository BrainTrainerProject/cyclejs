import { NotecardFormActions } from "../component/form/Notecard/notecard-form.actions";
import { NotecardForm } from "../component/form/Notecard/notecard-form";
import { SetForm, SetFormActions } from "../component/form/Set/SetForm";

export const ModalActions = {

    Open: (title, props, componentFn) => ({
        type: 'open',
        props: {
            ...props,
            title: title,
        },
        component: componentFn
    })

};

export const NotecardFormModal = {

    Create: (setId: string) => ModalActions.Open(
        'Notecard erstellen',
        {action: NotecardFormActions.Create(setId)},
        NotecardForm),

    Edit: (notecardId: string) => ModalActions.Open(
        'Notecard bearbeiten',
        {action: NotecardFormActions.Edit(notecardId)},
        NotecardForm)

};

export const SetFormModal = {

    Create: () => ModalActions.Open(
        'Set erstellen',
        {action: SetFormActions.Create()},
        SetForm
    ),

    Edit: (setId: string) => ModalActions.Open(
        'Set bearbeiten',
        {action: SetFormActions.Edit(setId)},
        SetForm
    )

};