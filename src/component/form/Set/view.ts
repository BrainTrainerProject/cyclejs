import {Stream} from 'xstream';
import { button, div, form, i, img, input, label, option, select, textarea } from '@cycle/dom';
import {VNode} from 'snabbdom/vnode';
import {Visibility} from '../../../common/Visibility';
import {isNullOrUndefined, isUndefined} from 'util';
import {Utils} from '../../../common/Utils';
import {errorMessage} from '../../../common/GuiUtils';
import { SetFormState } from "./SetForm";
const R = require('ramda');

export const ID_DELETE_BTN = '.btn_delete';
export const BTN_SUBMIT = '.btn_submit';
export const INP_TITLE = '.inp_title';
export const INP_DESC = '.inp_desc';
export const INP_TAGS = '.inp_tags';
export const INP_VISBILITY = '.inp_visibility';

export const ERR_TITLE = 'err_title';

export function view(state$: Stream<SetFormState>): Stream<VNode> {
    return state$
        .map(state => {
            console.log('VIEW STATE', state);
            return getCreateForm(state);
        });
}

function imageUpload(event, state: SetFormState) {
    let file = event.target.files[0];

    if (!file.type.match('image.*')) {
        // error
    } else {

        const reader = new FileReader();
        reader.onload = (function(file) {
            return function(e) {
                const imgSrc = e.target.result;
                const preview = document.getElementById('set-image');
                preview.src = state.imageUrl = imgSrc;
            };

        })(file);
        reader.readAsDataURL(file);
    }
}

function getCreateForm(state: SetFormState): VNode {

    const errJson = (!isNullOrUndefined(state.errors)) ? state.errors : isUndefined;
    const hasTitleError: boolean = (!isNullOrUndefined(errJson) && errJson.hasOwnProperty(INP_TITLE));
    const hasDescError: boolean = (!isNullOrUndefined(errJson) && errJson.hasOwnProperty(INP_DESC));
    const hasTagsError: boolean = (!isNullOrUndefined(errJson) && errJson.hasOwnProperty(INP_TAGS));

    return div('.ui.grid', [
        div('.four.wide.column', [

            div('.blurring.dimmable.image', [
                div('.ui.dimmer', [
                    div('.content', [
                        div('.center', [

                            div('.ui.inverted.button', {
                                hook: {
                                    insert: (vnode) => {
                                        $('#file').change(function(e) {
                                            imageUpload(e, state);
                                            $(vnode.elm).parent().parent().parent().dimmer('hide');
                                        });

                                        $(vnode.elm).on('click', function() {
                                            $('#file').trigger('click');
                                        });
                                    }
                                }
                            }, [`Bild hochladen`])
                        ])
                    ])
                ]),

                img('#set-image.ui.medium.image', {
                    attrs: {
                        'src': Utils.imageUrl('/card-placeholder.png'),
                        'className': 'ui medium image'
                    },
                    hook: {
                        insert: (vnode) => {
                            $(vnode.elm).parent().dimmer({on: 'hover'});
                        }
                    }
                })
            ]),
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
                        },[state.description])
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
                    div('.eight.wide.field',[
                        (state.action.type !== 'edit') ? null : button(ID_DELETE_BTN + '.ui.icon.red.basic.button.', {
                            'attrs': {
                                'type': 'submit'
                            }
                        }, [
                            i('.icon.trash.outline')
                        ])
                    ]),
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
                            }
                        }, [ (state.action.type === 'edit') ? 'bearbeiten' : 'erstellen'])
                    ])
                ])
            ]),
            errorMessage(state)
        ])
    ]);
}