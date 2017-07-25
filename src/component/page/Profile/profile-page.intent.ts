import { ID_FOLLOWER_BTN } from "./profile-page";

const Route = require('route-parser');

export interface IntentSinks {
    loadProfile$,
    aboClick$
}

export function intent(sources) {

    const {router, DOM} = sources;

    const path$ = router.history$
        .map(h => h.pathname)
        .filter(path => (path))
        .map(path => {
            const route = new Route('/profile(/:id)');
            return route.match(path);
        }).debug('URI: ');

    const loadProfile$ = path$.filter(path => path);

    const aboClick$ = DOM.select(ID_FOLLOWER_BTN).events('click').map(e => e.preventDefault()).debug('ABO CLICK');

    return {
        loadProfile$,
        aboClick$
    }

}