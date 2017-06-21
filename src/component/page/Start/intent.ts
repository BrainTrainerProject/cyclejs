import { AppSources } from "../../../app";
import { ID_NEW_SET_BTN } from "./StartPage";
import { GetSetsApi } from "../../../common/api/GetSets";
import xs from 'xstream'
import { PostSetApi } from "../../../common/api/PostSet";

export function intent(sources: AppSources) {

    const {DOM,HTTP} = sources;

    return {
        newSetClick$: DOM.select(ID_NEW_SET_BTN).events('click').debug('CLICK'),
        refreshSetList$: xs.of(GetSetsApi.buildRequest()),
        newSetResponse$: HTTP.select(PostSetApi.ID).flatten().startWith(null).filter(r=> !!r)
    };

}