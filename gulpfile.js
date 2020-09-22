var config = require("./gulp/config.js");
var { series, parallel } = require("gulp");
var load = require("require-dir");
var tasks, development, production;

tasks = load("./gulp/tasks", { recurse: true });

development = series(parallel(
  tasks["clean-log"],
  tasks["copy-third_party"],
  tasks["copy-images"],
  tasks["copy-javascripts"],
  tasks["compile-sass"]
));

production = series(parallel(
  tasks["clean-log"],
  tasks["copy-third_party"],
  tasks["copy-images"],
  tasks["minify-javascripts"],
  tasks["compile-sass"]
));

module.exports = {
  //"clean-log": series(tasks["clean-log"]),
  //"copy-third_party": series(tasks["copy-third_party"]),
  //"copy-images": series(tasks["copy-images"]),
  //"copy-javascripts": series(tasks["copy-javascripts"]),
  //"compile-sass": series(tasks["compile-sass"]),
  development,
  production,
  default: config.env.IS_DEVELOPMENT ? development : production
};