import xs from "xstream";
import { adapt } from "@cycle/run/lib/adapt";

export function makeModalDriver() {

    function modalDriver(sources$) {
        const sinks$ = xs.create({
            start: outgoing => {
                sources$.addListener({
                    next: incoming => {
                        outgoing.next(incoming);
                    },
                    error: () => {},
                    complete: () => {}
                });
            },
            stop: () => {}
        });
        return adapt(sinks$);
    }

    return modalDriver

}