"use strict";
const { Observable } = require("./src/es-observable.js");
const { runTests } = require("es-observable/commonjs/test/default.js");

process.on("uncaughtException", err => {
  /* eslint-disable no-console */
  console.error("uncaughtException", err);
});

runTests(Observable);
