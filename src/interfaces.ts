import { Stream } from "xstream";
import { DOMSource, VNode } from "@cycle/dom";
import { HTTPSource, RequestOptions } from "@cycle/http";

export type Sources = {
    DOM: DOMSource;
    HTTP: HTTPSource;
};

export type RootSinks = {
    DOM: Stream<VNode>;
    HTTP: Stream<RequestOptions>;
};

export interface State {
}
export type Reducer = (prev?: State) => State | undefined;
export type Sinks = Partial<RootSinks>;
export type Component = (s: Sources) => Sinks;
