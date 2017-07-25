const Route = require('route-parser');

export interface IntentSinks {
    loadProfile$
}

export function intent(sources) {

    const {router} = sources;

    const path$ = router.history$
        .map(h => h.pathname)
        .filter(path => (path))
        .map(path => {
            const route = new Route('/profile(/:id)');
            return route.match(path);
        }).debug('URI: ');

    const loadProfile$ = path$.filter(path => path);

    return {
        loadProfile$
    }

}