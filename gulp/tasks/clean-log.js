var config = require("../config.js");
var del = require("del");
var clean;

clean = async function () {
  await del("./**/*", { cwd: config.path.log });
};

module.exports = clean;
