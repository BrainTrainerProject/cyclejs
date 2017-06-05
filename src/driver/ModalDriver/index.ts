import xs from "xstream";
import { adapt } from "@cycle/run/lib/adapt";
import { li } from "@cycle/dom";

export function makeModalDriver() {

    function modalDriver(outgoing$) {

        outgoing$.addListener({
            next: outgoing => {
                console.log("Outgoing")
                console.log(outgoing);
            },
            error: () => {
            },
            complete: () => {
            }
        });

        const incoming$ = xs.create({
            start: listener => {
                console.log("Modal Driver Incoming")
                console.log(listener)
                outgoing$.map(s => console.log("SS: " + s));
                listener.next({hake: "peter"})
            },
            stop: () => {
            }
        })

        return adapt(incoming$);
    }

    return modalDriver

}