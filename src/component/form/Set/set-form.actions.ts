export enum ActionType {
    CREATE = 'create',
    EDIT = 'edit'
}

export interface CreateSetFormAction {
    type: ActionType.CREATE
}

export interface EditSetFormAction {
    type: ActionType.EDIT;
    setId: string;
}

export type SetFormAction = EditSetFormAction | CreateSetFormAction;

export const SetFormActions = {

    Create: (): CreateSetFormAction => ({
        type: ActionType.CREATE
    }),

    Edit: (setId: string): EditSetFormAction => ({
        type: ActionType.EDIT,
        setId: setId
    }),

};