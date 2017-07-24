export enum ActionType {
    SHOW = 'practise-show',
    PRACTISE = 'practise-',
    PRACTISE_AMOUNT = 'practise-amount',
    PRACTISE_BY_SET = 'practise-by-set',
    PRACTISE_BY_SET_AMOUNT = 'practise-by-set-amount',
}

type Action = {
    type: ActionType
}

type ShowAction = Action & {
    notecardId: string
}

type AmountAction = Action & {
    amount: number
}

type SetIdAction = Action & {
    setId: string
}

export type PracticeFormAction = Action | ShowAction | AmountAction | SetIdAction;

export const PracticeFormActions = {

    Show: (notecardId: string): ShowAction => ({
        type: ActionType.SHOW,
        notecardId: notecardId
    }),

    Practice: () => ({
        type: ActionType.PRACTISE
    }),

    PracticeAmount: (amount: number): Action & AmountAction => ({
        type: ActionType.PRACTISE_AMOUNT,
        amount: amount
    }),

    PracticeBySet: (setId: string): Action & SetIdAction => ({
        type: ActionType.PRACTISE_BY_SET,
        setId: setId
    }),

    PracticeBySetAmount: (setId: string, amount: number): Action & SetIdAction & AmountAction => ({
        type: ActionType.PRACTISE_BY_SET_AMOUNT,
        setId: setId,
        amount: amount
    })

};