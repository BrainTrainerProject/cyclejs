import { Stream } from "xstream";
import { StateSource } from "cycle-onionify";
import { DOMSource } from "@cycle/dom";

export interface StateListItemSources {
    DOM: DOMSource;
    onion: StateSource<any>;
}

export interface StateListItemSinks {
    DOM: Stream<any>,
    HTTP: Stream<any>,
    callback$: Stream<any>,
    reducer: Stream<any>
}