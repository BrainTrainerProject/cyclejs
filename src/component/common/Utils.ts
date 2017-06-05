export function jsonHasChilds(json) {
    let itm;
    for (itm in json)
        return true;
    return false;
}