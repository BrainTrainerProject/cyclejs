const buildExt = require('./tasks/build-extern');

function buildWebApp(path) {

    /*console.log("Try to create folder: " + path);

    if (path === undefined) {
        console.error("No path was submitted")
    } else {
        buildExt.build(path);
    }*/

}

module.exports = {
    buildWebApp: buildWebApp
};