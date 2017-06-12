import { Component } from "../../common/interfaces";
import xs from "xstream";
import { makeAuth0Driver, protect } from "cyclejs-auth0";
import LoginPage from "./Login/LoginPage";

export function ProtectedPage(component: Component) {
    return function (sources) {

console.log(sources);
        const tokens$ = sources.auth0.tokens$;
        const route$ = sources.router.history$.map(s => {
            console.log(s);
            return s;
        });

        const loggedOut$ = tokens$
            .filter(token => !token);

        const loginPage$ = loggedOut$
            .mapTo('/login?prev=' + window.location.pathname)
            .debug('Loing Redicre');

        const componentSinks = protect(component, {
            decorators: {
                HTTP: (request, token) => {
                    return {
                        ...request,
                        headers: {
                            ...request.headers,
                            "Authorization": "Bearer:" + token
                        }
                    }
                }
            }
        })(sources);

        //const loginSinks = ProtectedPage(LoginPage)(sources);

        /*return{
            DOM: loginSinks.DOM || xs.never(),
            HTTP: loginSinks.HTTP || xs.never(),
            router: loginSinks.router || xs.never(),
            onion: loginSinks.onion || xs.never(),
            modal: loginSinks.modal || xs.never(),
            auth0: loginSinks.auth0 || xs.never()
        }*/

        return {
            ...componentSinks,
            //auth0: xs.never(),
            //router: xs.merge(loginPage$, componentSinks.router || xs.never(), route$)
        }
    }
}