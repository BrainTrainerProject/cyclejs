import xs, {Stream} from 'xstream';
import {NotecardFormState, NotecardFormSubmitType, NotecardVisibiblityType} from './index';
import {Reducer} from '../../../interfaces';

export function model(http: any, intent: any, prevState?: NotecardFormState) {

    const default$: Stream<Reducer> = xs.of(function defaultReducer(): any {
        if (typeof prevState === 'undefined') {

            return Object.assign({}, {
                type: NotecardFormSubmitType.ADD,
                title: 'test',
                description: '',
                tags: '',
                visbility: NotecardVisibiblityType.PRIVATE,
                submit: false
            });

        } else {
            return prevState;
        }
    });

    const titleChange$: Stream<Reducer> = intent.inputTitle$
        .map(ev => (ev.target as any).value)
        .map(title => function titleReducer(prevState: NotecardFormState): NotecardFormState {

            return Object.assign({}, prevState, {
                title: title
            });

        });


    const descChange$: Stream<Reducer> = intent.inputDescription$
        .map(ev => (ev.target as any).value)
        .map(title => function descriptionReducer(prevState: NotecardFormState): NotecardFormState {

            return Object.assign({}, prevState, {
                description: title
            });

        });

    const tagsChange$: Stream<Reducer> = intent.inputTags$
        .map(ev => (ev.target as any).value)
        .map(tags => function tagsReducer(prevState: NotecardFormState): NotecardFormState {

            return Object.assign({}, prevState, {
                tags: tags
            });

        });

    const visibilityChange$: Stream<Reducer> = intent.selectVisibility$
        .map(ev => {
            for (let child of ev.target.children) {
                if (child.selected) {
                    switch (child.value) {
                        case 'private' :
                            return NotecardVisibiblityType.PRIVATE;
                        case 'public' :
                            return NotecardVisibiblityType.PUBLIC;
                    }
                }
            }
            return NotecardVisibiblityType.PRIVATE;
        })
        .map(tags => function tagsReducer(prevState: NotecardFormState): NotecardFormState {

            return Object.assign({}, prevState, {
                visibility: tags
            });

        });
    /*intent.submit$.map(tags => function tagsReducer(state: NotecardFormState) {

     return state;

     }) as Stream<Reducer>*/
    const submitForm$ = intent.submit$;

    const request$ = submitForm$
        .map(m => function tagsReducer(state: NotecardFormState) {
            return {
                url: 'http://localhost:8080/api/notecard',
                method: 'POST',
                category: 'post-notecard',
                send: {
                    'title': state.title,
                    'task': state.description,
                    'answer': state.tags,
                }
            };
        }).debug();

    const response$ = http
        .select('post-notecard')
        .flatten()
        .debug();

    const sinks = {
        HTTP: request$,
        DOM: response$,
        onion: xs.merge(
            default$,
            titleChange$,
            descChange$,
            tagsChange$,
            visibilityChange$,
            submitForm$
        )
    };

    return sinks;

}