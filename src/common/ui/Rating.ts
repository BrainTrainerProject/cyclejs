import { VNode } from "snabbdom/vnode";
import { div, i, span } from "@cycle/dom";

const MAX_SCORE = 5;

export function Rating(score: number, sum?: number): VNode {
    return div('ui', [
        div('.ui.rating', stars(score)),
        (sum) ? span('.rating-count', ['(' + sum + ')']) : ''
    ]);

}

function stars(score): VNode[] {
    let vnode: VNode[] = [];
    for (let ii = 0; ii < MAX_SCORE; ii++) {
        const item: VNode = i(".icon", {class: {active: ii < score}});
        vnode.push(item);
    }
    return vnode;
}