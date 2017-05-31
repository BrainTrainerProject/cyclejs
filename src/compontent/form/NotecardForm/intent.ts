import { DOMSource } from "@cycle/dom";
import { BTN_SUBMIT, INP_DESC, INP_TAGS, INP_TITLE, INP_VISBILITY } from "./index";

export function intent(dom: DOMSource): any {
    return {
        submit$: dom.select(BTN_SUBMIT).events("click")
            .map(ev => {
                ev.preventDefault();
                return ev;
            }),
        inputTitle$: dom.select(INP_TITLE).events("input"),
        inputDescription$: dom.select(INP_DESC).events("input"),
        inputTags$: dom.select(INP_TAGS).events("input"),
        selectVisibility$: dom.select(INP_VISBILITY).events("change")
    };
}