import { Component } from "../../common/interfaces";

import { makeAuth0Driver, protect } from "cyclejs-auth0";

export function ProtectedPage(component: Component) {
    return function (sources) {

        const protectedComponent = protect(component, {
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

        return {
            ...protectedComponent
        }
    }
}