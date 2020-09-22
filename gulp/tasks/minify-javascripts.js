var config = require("../config.js");
var { src, dest, series, parallel } = require("gulp");
var del = require("del");
var uglify = require("gulp-uglify");
var clean, minify;

clean = async function () {
  await del("./javascripts/**/*", { cwd: config.path.output });
};

minify = function () {
  return src("./javascripts/**/*", { cwd: config.path.input })
    .pipe(uglify(config.uglify))
    .pipe(dest("./javascripts", { cwd: config.path.output }));
};

module.exports = series(clean, minify);