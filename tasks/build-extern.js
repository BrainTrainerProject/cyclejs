const gulp = require('gulp');
const clean = require('gulp-clean');
const gulpRequireTasks = require('gulp-require-tasks');
const runSequence = require('run-sequence');

var _externFolder = undefined;

gulpRequireTasks({
    path: process.cwd() + '/tasks'
});

gulp.task("extern:clean", function () {
    return gulp.src(['./public', './lib'], {read: false})
        .pipe(clean());
});

gulp.task("extern:build", function (callback) {
    runSequence(
        'ts',
        [
            'styles',
            'templates',
            'images'
        ],
        'bundle', callback);
});

gulp.task("extern:move", function () {
    if (_externFolder !== undefined)
        return gulp.src('./public/**/*').pipe(gulp.dest(_externFolder));
    else return done
});

function runBuild(externFolder) {
    _externFolder = externFolder;
    runSequence('extern:build', 'extern:move', 'extern:clean');
}

module.exports = {
    build: runBuild
};