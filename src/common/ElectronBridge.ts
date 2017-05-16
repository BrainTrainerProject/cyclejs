export function isElectron(): boolean {
    return (<any>window).bridge !== undefined
}

export interface ExecuteOnElectron {
    type: string
}

export interface ElectronPopup extends ExecuteOnElectron {
    data: {
        lectionId: number
    }
}

export function execOnElectron(data: ExecuteOnElectron) {
    if (isElectron()) (<any>window).bridge.exec(data)
}