import {Sinks} from './interfaces';
import {extractSinks, filterProp} from 'cyclejs-utils';
import xs from 'xstream';

const config = require('../config.json');

export class Utils {

    public static slashCheck(url: string): string {
        return url.charAt(0) === '/' ? url.substring(1) : url;
    }

    public static apiUrl(urlCall: string): string {
        return config.apiUrl + Utils.slashCheck(urlCall);
    }

    public static imageUrl(url: string): string {
        return '/src/img/' + Utils.slashCheck(url);
    }

    public static imageOrPlaceHolder(url: string): string {
        return (url) ? url : '/src/img/' + Utils.slashCheck('/card-placeholder.png');
    }

    public static jsonHasChilds(json: any): boolean {
        for (const itm in json) {
            return true;
        }
        return false;
    }

    public static filterPropsByArray(sinks: any, props: string[]): any {
        let currSinks: Sinks = sinks;
        for (const prop of props) {
            currSinks = filterProp(extractSinks(xs.of(currSinks), Object.keys(currSinks)), prop);
        }
        return currSinks;

    }

    public static isNumber(number: any): boolean {
        const res = parseInt(number);
        return !isNaN(res);
    }

    public static syncDelay(ms: number): void {
        const curr = Date.now();
        let passed = 0;
        while (passed < ms) {
            passed = Date.now() - curr;
        }
    }

}