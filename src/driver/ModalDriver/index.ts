import xs from "xstream";
import { adapt } from "@cycle/run/lib/adapt";
import { DevToolEnabledSource } from "@cycle/run";
import { isNullOrUndefined } from "util";
import { Component } from "../../common/interfaces";

/*export class ModalSource {

    constructor(private _res$$) {
    }

    public get() {
        return adapt(this._res$$) as DevToolEnabledSource;
    }

}

export interface ModalOpen {
    type: 'open';
    component: Component;
}

export interface ModalClose {
    type: 'close';
    count?: number; //Default is one
}

export type ModalAction = ModalOpen | ModalClose;

export function makeModalDriver() {

    function modalDriver(request$) {

        const response$ = xs.create({
            start: listener => {

                request$.addListener({
                    next: request => {
                        console.log("Request")
                        if (!isNullOrUndefined(request) && isValidRequest(request)) {
                            console.log("Response")
                            listener.next(request);
                        }
                    },
                    error: () => {
                    },
                    complete: () => {
                    }
                });

            },
            stop: () => {
            }
        });

        return {
            request(){
                return adapt(response$)
            }
        }
    }

    return modalDriver

}

function isValidRequest(request: any): boolean {
    if (typeof request === 'object') {
        switch (request.type) {
            case 'close':
            case 'open':
                return true;
            default:
                return false;
        }
    }
    return false;
}*/