const mkdirp = require('mkdirp');
const path = require('path');
const shell = require('shelljs');
const mv = require('mv');
const gulp = require('gulp');

function buildWebApp(mPath) {

    console.log("Try to create folder: " + mPath);

    if (mPath === undefined) {
        console.error("Kein Pfad angegeben!")
    } else {
        runBuildPublicFolder()
        moveFilesToExternFolder(mPath)
    }

}

function runBuildPublicFolder() {
    console.log("Run Build Public Folder");
    if (shell.exec('npm run gulp build-extern').code !== 0) {
        shell.echo('Error: Couldn\'t build public folder');
        shell.exit(1);
    }
}

function moveFilesToExternFolder(destFolder) {
    gulp.src('./public/**/*').pipe(gulp.dest(destFolder))
}

module.exports = {
    buildWebApp: buildWebApp
};