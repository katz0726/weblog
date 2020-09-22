var config = require("../config.js");
var { src, dest, series, parallel } = require("gulp");
var del = require("del");

var clean = async function () {
  await del("./third_party/**/*", { cwd: config.path.output });
};

var jquery = function () {
  return src("./jquery/dist/**/*", { cwd: config.path.node_modules })
    .pipe(dest("./third_party/jquery", { cwd: config.path.output }));
};

var popper = function () {
  return src("./popper.js/dist/**/*", { cwd: config.path.node_modules })
    .pipe(dest("./third_party/popper.js", { cwd: config.path.output }));
};

var bootstrap = function () {
  return src("./bootstrap/dist/**/*", { cwd: config.path.node_modules })
    .pipe(dest("./third_party/bootstrap", { cwd: config.path.output }));
};

var fontAwesome = function () {
  return src("./font-awesome/**/*", { cwd: config.path.node_modules })
    .pipe(dest("./third_party/font-awesome", { cwd: config.path.output }));
};

module.exports = series(
  clean,
  parallel(jquery, popper, bootstrap, fontAwesome)
);