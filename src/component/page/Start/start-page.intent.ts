import { AppSources } from "../../../app";
import { ID_NEW_SET_BTN } from "./start-page";

export function intent(sources: AppSources) {

    const {DOM, HTTP} = sources;

    return {
        createSet$: DOM.select(ID_NEW_SET_BTN).events('click').debug('CLICK').remember(),
    };

}