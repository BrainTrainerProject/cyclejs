import { Reducer, Sinks, Sources, State } from '../../common/interfaces';
import xs, { Stream } from 'xstream';
import { button, div, form, h5, i, img, input, p, textarea } from '@cycle/dom';
import { errorMessage, ErrorMessageState, inputErrorState, inputStream } from "../../common/GuiUtils";
import { VNode } from "snabbdom/vnode";
import { Utils } from "../../common/Utils";
import sampleCombine from "xstream/extra/sampleCombine";
import { AddCommentToSet, CommentRepository, RequestMethod } from "../../common/repository/CommentRepository";
import { CommentListAction, CommentsList } from "../lists/comments/CommentsList";
import isolate from "@cycle/isolate";
import dropRepeats from "xstream/extra/dropRepeats";

export type CommentsSources = Sources & {};
export type CommentsSinks = Sinks & { onion: Stream<Reducer> };

export interface CommentsState extends State {
    setId: string,
    rating: number;
    comment: string;
    errors: ErrorMessageState
}

const ID_RATING = '.comment-rating';
const ID_COMMENT = '.comment-comment';
const ID_SUBMIT = '.comment-submit';

export interface CommentsProps {
    setId: string;
}

function intent(sources) {

    const {DOM} = sources;

    const commentInput$ = DOM.select(ID_COMMENT).events('input').map(e => e.target.value);
    const submit$ = DOM.select(ID_SUBMIT).events('click').map(e => event.preventDefault());

    return {
        commentInput$,
        submit$
    }

}

function model(action, state$) {

    const init$ = xs.of((state) => {
        return ({
            ...state,
            rating: 0,
            comment: '',
            errors: []
        })
    }).debug('INIT!');

    const ratingChange$ = inputStream(ID_RATING, 'rating', action.ratingProxy$);
    const comment$ = inputStream(ID_COMMENT, 'comment', action.commentInput$);

    const submit$ = action.submit$
        .map(ignored => (state) => {

            if (!state.comment) {
                state = inputErrorState(ID_COMMENT, 'Kommentar eingeben!', state);
            }

            if (!state.rating || state.rating === 0) {
                state = inputErrorState(ID_RATING, 'Bewertung eingeben!', state);
            }

            return state;

        }).debug('SUBMIT');

    const validSubmit$ = submit$
        .compose(sampleCombine(state$))
        .map(([event, state]) => {
            console.log("VAI")
            console.log(state)
            return state
        })
        .filter(state => !Utils.jsonHasChilds(state.errors)).debug('validSubmit$');

    const cleanValidSubmit$ = validSubmit$
        .map(s => (state) => {
            console.log("CleanValidSubmit");
            console.log(s)
            console.log(state);
            return {
                ...state,
                rating: 0,
                comment: '',
                errors: []
            }
        });

    const reducer$ = xs.merge(init$, ratingChange$, comment$, submit$, cleanValidSubmit$);

    return {
        reducer$,
        validSubmit$
    };
}

export default function Comments(sources: CommentsSources, props: CommentsProps) {

    const {router, onion} = sources;
    const state$ = onion.state$;
    sources.onion.state$.debug("STATE CHANGE COMMENTS");

    const ratingProxy$ = xs.create();
    const submitProxy$ = xs.create();
    const actions = intent(sources);
    const models = model({...actions, ratingProxy$}, state$);

    const addCommentAction$ = models.validSubmit$.debug('SSSSSSSS')
        .map(state => {
            console.log("AddCommentAction$");
            console.log(state);
            return {
                type: RequestMethod.ADD_COMMENT_TO_SET,
                setId: state.setId,
                comment: {
                    score: state.rating,
                    comment: state.comment
                }
            } as AddCommentToSet
        }).debug("SUBMIT ACTION ADD COMMANT");

    const commentRepository = CommentRepository(sources, addCommentAction$ as Stream<any>);

    const commentsListAction$ = state$
        .compose(dropRepeats(<State>(oldState, newState) => oldState.setId === newState.setId))
        .map(state => state.setId)
        .filter(setId => !!setId)
        .map(setId => CommentListAction.GetBySetId(setId))
        .remember();

    const commentsList = isolate(CommentsList, 'commentsList')(sources, commentsListAction$);

    return {
        DOM: view(state$, ratingProxy$, commentsList.DOM.debug('COMMENTS LIST VIEW')),
        onion: xs.merge(models.reducer$, commentsList.onion),
        HTTP: xs.merge(commentRepository.HTTP, commentsList.HTTP),
        router: commentsList.profileClick$.map(id => {
            console.log("Profile Click")
            return '/profile/' + id
        })
    };
}

function view(state$, ratingProxy$, comments$): Stream<VNode> {

    return xs.combine(state$, comments$)
        .debug('state change')
        .map(([state, comments]) => {
            console.log("COMMIT ", comments)
            console.log("COMMIT ", state)
            return div([

                // FORM
                div('.ui.grid', [

                    div('.sixteen.wide.column', [
                        form('.ui.form', [
                            h5('.ui.header', [`Bewertung`]),
                            div('.field', [
                                textarea(ID_COMMENT, {
                                    'attrs': {
                                        'placeholder': 'Bewertung'
                                    },
                                    hook: {
                                        update: (oldNode, newNode) => {
                                            $(newNode.elm).val(state.comment)
                                        }
                                    }
                                })
                            ]),
                            div('.fields', [
                                div('.four.wide.field', [
                                    div('.ui.rating', {
                                        attrs: {'data-max-rating': 5},
                                        hook: {
                                            insert: ({elm}) => {

                                                const listener$ = xs.create();
                                                ratingProxy$.imitate(listener$);

                                                ($(elm) as any).rating('setting', 'clearable', true);
                                                ($(elm) as any).rating('setting', 'onRate', function (value) {
                                                    listener$.shamefullySendNext(value);
                                                });
                                            },
                                            update: (oldVNode, newVNode) => {
                                                ($(newVNode.elm) as  any).rating('set rating', state.rating)
                                            }
                                        }
                                    }),
                                ]),
                                div('.eight.wide.field.right.floated'),
                                div('.four.wide.field.', [
                                    button(ID_SUBMIT + '.ui.button.right.fluid.floated.', [`bewerten`])
                                ])
                            ])
                        ])
                    ]),
                ]),
                errorMessage(state),
                comments,
            ])
        });
}