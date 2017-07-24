import {button, div, h3, i, img, p} from '@cycle/dom';
import {ID_EDIT_SET_BTN, SetPageState} from './SetPage';
import {Utils} from '../../../common/Utils';
export function viewLeft([state, notecards, comments]) {

    const set = (state as SetPageState).set;
    console.log('SetPage$', set);

    if (!set) {
        return ['Loading ...'];
    } else {

        return [

            div('.ui.grid', [

                // Cover
                div('.three.wide.column', [
                    div('.ui.one.column.grid', [
                        div('.column', [
                            div('.ui.fluid.card', [
                                div('.image', [
                                    img({
                                        'attrs': {
                                            'src': Utils.imageOrPlaceHolder(set.photourl)
                                        }
                                    })
                                ])
                            ])
                        ])
                    ])
                ]),


                // Title
                div('.thirteen.wide.column', {
                    'attributes': {
                        'className': 'eight wide column'
                    },
                    'style': {
                        'name': 'style',
                        'value': 'padding-top: 1.75em'
                    }
                }, [

                    div('.ui.grid', [

                        // Title
                        div('.eight.wide.column.middle.aligned', [
                            h3('.ui.medium.header', [set.title])
                        ]),

                        // Buttons
                        div('.eight.wide.column', [
                            button(ID_EDIT_SET_BTN + '.ui.icon.button.right.floated', [
                                i('.icon.edit')
                            ])
                        ]),

                        // Beschreibung
                        div('.sixteen.wide.column', [
                            p([set.description])
                        ])

                    ])

                ]),

            ]),

            div('.ui.divider'),
            notecards,
            div('.ui.divider'),
            comments
        ];

    }
}