import { Component } from "../../common/interfaces";
import xs from "xstream";
import { makeAuth0Driver, protect } from "cyclejs-auth0";
import LoginPage from "./Login/LoginPage";

export function ProtectedPage(component: Component) {
    return function (sources) {

        const {auth0} = sources;

        const tokens$ = sources.auth0.tokens$;
        const route$ = sources.router.history$.map(s => {return s;});

        const isNotLoggedIn$ = tokens$
            .filter(token => !token);

        const loginPage$ = isNotLoggedIn$
            .map(s => '/login');

        const logoutRequest$ = route$
            .map(path => path.pathname)
            .filter(path => path === '/logout')
            .mapTo({action: "logout"})
            .remember();

        const redirictLogoutPage$ = logoutRequest$
            .mapTo('/login');

        const loggedIn$ = auth0.select('authenticated')

        const redirectLogin$ = loggedIn$.mapTo('/start')

        const componentSinks = protect(component, {
            decorators: {
                HTTP: (request, token) => {

                    console.log("REQQQQQQQQQQQQQQQQQQQQ!!!!", request);

                    return {
                        ...request,
                        headers: {
                            ...request.headers,
                            "Authorization": "Bearer " + token.idToken
                        }
                    }
                }
            }
        })(sources);


        let sinks = {
            ...componentSinks,
            router: xs.merge(componentSinks.router || xs.empty(), loginPage$, loggedIn$.mapTo('/start'), route$, redirectLogin$,redirictLogoutPage$),
            auth0: xs.merge(logoutRequest$, componentSinks.auth0 || xs.empty())
        };

        return sinks;
    }
}