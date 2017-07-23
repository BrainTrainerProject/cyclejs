export enum ActionType {
    CREATE = 'create',
    EDIT = 'edit'
}

type Action = {
    type: ActionType
}

export type SetIdAction = Action & {
    setId: string
}

export type NotecardIdAction = Action & {
    notecardId: string
}

export type NotecardFormAction = Action | SetIdAction | NotecardIdAction

export const NotecardFormActions = {

    Create: (setId: string): SetIdAction => ({
        type: ActionType.CREATE,
        setId: setId
    }),

    Edit: (notecardId: string): NotecardIdAction => ({
        type: ActionType.EDIT,
        notecardId: notecardId
    }),

};