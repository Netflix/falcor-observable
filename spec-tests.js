"use strict";
const { Observable } = require("./src/es-observable.js");
const { runTests } = require("es-observable/commonjs/test/default.js");

runTests(Observable);
