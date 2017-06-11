const config = require('../config.json');

export class Utils {

    static slashCheck(url: string): string {
        return url.charAt(0) === '/' ? url.substring(1) : url;
    }

    static apiUrl(urlCall) {
        return config.apiUrl + Utils.slashCheck(urlCall)
    };

    static imageUrl(url) {
        console.log(url);
        return '/src/img/' + Utils.slashCheck(url)
    };

    static jsonHasChilds(json) {
        for (let itm in json)
            return true;
        return false;
    }

}