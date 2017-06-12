import xs from "xstream";
import { button, div, img, pre, span, strong } from "@cycle/dom";
import { Utils } from "../../../common/Utils";
const jwt = require("jwt-decode");

export default function LoginPage(sources) {

    const {DOM, auth0, props} = sources;

    const loginButton$ = DOM.select('.login-button').events('click');

    const showLoginForm$ = loginButton$.mapTo({action: 'show'});

    const logout$ = DOM
        .select(".logout")
        .events("click")
        .mapTo({action: "logout"});

    const showProfile$ = auth0
        .tokens$
        .map(tokens => DOM
            .select(".show-profile")
            .events("click")
            .mapTo({action: "getUserInfo", params: tokens.accessToken})
        )
        .flatten()

    const profile$ = auth0
        .select("getUserInfo")
        .map(({response}) => response);

    const state$ = xs
        .combine(props.tokens$, profile$.startWith(null))
        .map(([tokens, profile]) => ({
            user: tokens.idToken ? jwt(tokens.idToken) : null,
            profile: profile
        }))

    const vdom$ = state$
        .map(({user, profile}) => {

            const profileNode = profile ?
                pre(JSON.stringify(profile, null, 2)) :
                null;

            return user ?
                div([
                    div("hello " + user.nickname),
                    button(".logout", "logout"),
                    button(".show-profile", "Show profile"),
                    profileNode
                ]) :
                div("please log in")
        })

    const sinks = {
        DOM: xs.of(view(vdom$)),
        onion: xs.never(),
        auth0: showLoginForm$,
    };

    return sinks;
}

function view(profil) {
    return div(".login-form", [
        div(".position", [
            div(".content", [

                div(".box", [div(".logo-content", [
                    img({
                        "attrs": {
                            "src": Utils.imageUrl('/logo_big.png')
                        }
                    }),
                    span([
                        'Brain', strong(['Trainer'])
                    ])
                ]),
                    div(".ui.divider"),
                    div(".box-content", [
                        span(".question", ['Noch keinen Account?']),
                        button(".login-button", ['Einfach anmelden']),
                        img(".auth0-logo", {
                            "attrs": {
                                "src": Utils.imageUrl('/auth0-logo.png')
                            }
                        })
                    ])
                ])
            ])
        ])
    ])
}