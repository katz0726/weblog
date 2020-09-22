var config = require("../config.js");
var { src, dest, series, parallel } = require("gulp");
var del = require("del");
var sass = require("gulp-sass");
var clean, compile;

clean = async function () {
  await del("./stylesheets/**/*", { cwd: config.path.output });
};

compile = function () {
  return src("./stylesheets/**/*.scss", { cwd: config.path.input })
    .pipe(sass(config.sass))
    .pipe(dest("./stylesheets", { cwd: config.path.output }));
};

module.exports = series(clean, compile);