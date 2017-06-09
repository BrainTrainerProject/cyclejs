import {Stream} from 'xstream';
import {button, div, form, img, input, label, li, option, select, textarea, ul} from '@cycle/dom';
import {VNode} from 'snabbdom/vnode';
import {NotecardFormState} from './index';
import {Visibility} from '../../common/Visibility';
import {isNullOrUndefined, isUndefined} from 'util';
import {_} from 'underscore';
import {jsonHasChilds} from '../../common/Utils';

export const BTN_SUBMIT = '.btn_submit';
export const INP_TITLE = '.inp_title';
export const INP_DESC = '.inp_desc';
export const INP_TAGS = '.inp_tags';
export const INP_VISBILITY = '.inp_visibility';

export const ERR_TITLE = 'err_title';

export function view(state$ : Stream<NotecardFormState>) : Stream<VNode> {
    return state$
        .map(state => {
            return getCreateForm(state);
        });
}

function errorMessage(state) {
    if (!isNullOrUndefined(state.errors) && jsonHasChilds(state.errors)) {
        return div('.ui.error.message', [
            ul('.list', _.map(state.errors, function(error) {
                return li([error.msg]);
            }))
        ]);
    } else {
        return null;
    }
}

function getCreateForm(state : NotecardFormState) : VNode {

    const errJson = (!isNullOrUndefined(state.errors)) ? state.errors : isUndefined;
    const hasTitleError : boolean = (!isNullOrUndefined(errJson) && errJson.hasOwnProperty(INP_TITLE));
    const hasDescError : boolean = (!isNullOrUndefined(errJson) && errJson.hasOwnProperty(INP_DESC));
    const hasTagsError : boolean = (!isNullOrUndefined(errJson) && errJson.hasOwnProperty(INP_TAGS));

    return div('.ui.grid', [
        div('.four.wide.column', [
            img('.ui.medium.image', {
                'attrs': {
                    'src': 'http://i3.kym-cdn.com/photos/images/newsfeed/001/217/729/f9a.jpg',
                    'className': 'ui medium image'
                }
            })
        ]),
        div('.twelve.wide.column', [
            form('.ui.form', [
                div('.field', {class: {error: hasTitleError}}, [
                    label([`Titel`]),
                    div(INP_TITLE + '.field', [
                        input({
                            'attrs': {
                                'type': 'text',
                                'placeholder': 'Titel',
                                'value': state.title
                            }
                        })
                    ])
                ]),
                div('.field', {class: {error: hasDescError}}, [
                    label([`Beschreibung`]),
                    div(INP_DESC + '.field', [
                        textarea({
                            'attrs': {
                                'placeholder': 'Beschreibung',
                                'value': state.description
                            }
                        })
                    ])
                ]),
                div('.field', {class: {error: hasTagsError}}, [
                    label([`Tags`]),
                    div(INP_TAGS + '.field', [
                        input({
                            'attrs': {
                                'type': 'text',
                                'placeholder': 'Tags',
                                'value': state.tags
                            }
                        })
                    ])
                ]),
                div('.fields', [
                    div('.eight.wide.field'),
                    div('.four.wide.field.right.floated', [
                        select(INP_VISBILITY + '.ui.right.floated.dropdown', [
                            option({
                                    'attrs': {
                                        'value': 'private',
                                        'selected': (state.visibility === Visibility.PRIVATE) ? 'selected' : ''
                                    }
                                },
                                [`Privat`]
                            ),
                            option({
                                'attrs': {
                                    'value': 'public',
                                    'selected': (state.visibility === Visibility.PUBLIC) ? 'selected' : ''
                                }
                            }, [`Öffentlich`])
                        ])
                    ]),
                    div('.four.wide.field.', [
                        button(BTN_SUBMIT + '.ui.button.right.fluid.floated.', {
                            'attrs': {
                                'type': 'submit',
                                'className': 'ui button right fluid floated '
                            }
                        }, [`Submit`])
                    ])
                ])
            ]),
            errorMessage(state)
        ])
    ]);
}