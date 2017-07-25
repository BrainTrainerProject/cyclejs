import { Stream } from "xstream";
import { DOMSource, VNode } from "@cycle/dom";
import { HTTPSource, RequestOptions } from "@cycle/http";
import { StateSource } from "cycle-onionify";

export type Sources = {
    DOM: DOMSource;
    HTTP: HTTPSource;
    onion: StateSource<any>;
    modal: any;
    router: any;
    auth0: any;
    socket: any;
};

export type RootSinks = {
    DOM: Stream<VNode>;
    HTTP: Stream<RequestOptions>;
    modal: Stream<any>;
    router: Stream<any>;
    auth0: Stream<any>
};

export interface State {
}

export type Reducer = (prev?: State) => State | undefined;
export type Sinks = Partial<RootSinks>;
export type Component = (s: Sources) => Sinks;
