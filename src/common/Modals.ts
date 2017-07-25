import { NotecardFormActions } from "../component/form/Notecard/notecard-form.actions";
import { NotecardForm } from "../component/form/Notecard/notecard-form";
import { SetFormActions } from "../component/form/Set/set-form.actions";
import { SetForm } from "../component/form/Set/set-form";
import { PractiseFormActions } from "../component/form/Practise/practise-form.actions";
import { PractiseForm } from "../component/form/Practise/practise-form";

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
        NotecardForm),

    Show: (notecardId: string) => ModalActions.Open(
        'Notecard anzeigen',
        {action: NotecardFormActions.Show(notecardId)},
        NotecardForm
    )

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

export const PractiseModal = {

        ShowNotecard: (notecardId: string) => ModalActions.Open(
            'Notecard anzeigen',
            {action: PractiseFormActions.ShowNotecard(notecardId)},
            PractiseForm
        ),

        Practise: () => ModalActions.Open(
            'Übung',
            {action: PractiseFormActions.Practise()},
            PractiseForm
        ),

        PractiseAmount: (amount: number) => ModalActions.Open(
            'Übung',
            {action: PractiseFormActions.PractiseAmount(amount)},
            PractiseForm
        ),

        PractiseBySet: (setId: string) => ModalActions.Open(
            'Übung',
            {action: PractiseFormActions.PractiseBySet(setId)},
            PractiseForm
        ),
    
        PractiseBySetAmount: (setId: string, amount: number) => ModalActions.Open(
            'Übung',
            {action: PractiseFormActions.PractiseBySetAmount(setId, amount)},
            PractiseForm
        )

    }
;