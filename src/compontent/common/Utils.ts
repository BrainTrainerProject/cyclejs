export function jsonHasChilds(json) {
    let itm;
    for (itm in json)
        return false;
    return true;
}