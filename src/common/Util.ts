export class Util {

    static readonly apiUrl = function (urlCall) {
        return 'http://192.168.2.108:8080/api' + urlCall
    }

    static readonly imageUrl = function (url) {
        return '/src/img' + url
    }

}