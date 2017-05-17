const mkdirp = require('mkdirp');
const path = require('path');


function makeConsoleLog(mPath) {
	const path = mPath | process.cwd();
    console.log("Hey!!!")
    console.log("Du befindest dich gerade hier: " + path)
}

function buildWebApp(mPath) {
	const folder = mPath | path.resolve(process.cwd(), './public');
    mkdirp(folder, function (err) {
        if (err) console.error(err)
        else console.log('Created Folder: ' + folder)
    });
}

module.exports = {
    makeConsoleLog: makeConsoleLog,
    buildWebApp: buildWebApp
};