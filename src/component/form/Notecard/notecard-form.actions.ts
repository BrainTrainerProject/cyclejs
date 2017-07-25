export enum ActionType {
    CREATE = 'create',
    EDIT = 'edit',
    SHOW = 'show'
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

    Show: (notecardId: string) => ({
        type: ActionType.SHOW,
        notecardId: notecardId
    })

};