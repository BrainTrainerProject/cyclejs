import { Component } from "../../common/interfaces";
import xs from "xstream";
import { makeAuth0Driver, protect } from "cyclejs-auth0";
import LoginPage from "./Login/LoginPage";

export function ProtectedPage(component: Component) {
    return function (sources) {

        const prevUrl$ = xs.of(null).debug('prevUrl');

        const {auth0} = sources;

        const tokens$ = sources.auth0.tokens$;
        const route$ = sources.router.history$.map(s => {return s;});

        const isNotLoggedIn$ = tokens$
            .filter(token => !token);

        const loginPage$ = isNotLoggedIn$
            .map(s => '/login');

        const loggedIn$ = auth0.select('authenticated')

        const redirectLogin$ = loggedIn$.mapTo('/start')

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


        let sinks = {
            ...componentSinks,
            router: xs.merge(componentSinks.router || xs.empty(), loginPage$, loggedIn$.mapTo('/start'), route$, redirectLogin$)
        };

        return sinks;
    }
}