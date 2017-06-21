import { Sinks } from "./interfaces";
import { extractSinks, filterProp } from "cyclejs-utils";
import xs from "xstream";
const config = require('../config.json');

export class Utils {

    static slashCheck(url: string): string {
        return url.charAt(0) === '/' ? url.substring(1) : url;
    }

    static apiUrl(urlCall) {
        return config.apiUrl + Utils.slashCheck(urlCall)
    };

    static imageUrl(url) {
        return '/src/img/' + Utils.slashCheck(url)
    };

    static imageOrPlaceHolder(url) {
        if(url === '' || url === null || url === undefined){
            return '/src/img/' + Utils.slashCheck('/card-placeholder.png')
        }else{
            return url
        }
    };

    static jsonHasChilds(json) {
        for (let itm in json)
            return true;
        return false;
    }

    static filterPropsByArray(sinks: any, props: string[]) {
        let currSinks: Sinks = sinks;
        for (let prop of props) {
            currSinks = filterProp(extractSinks(xs.of(currSinks), Object.keys(currSinks)), prop)
        }
        return currSinks;

    }

}