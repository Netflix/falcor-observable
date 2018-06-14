"use strict";
const { Observable } = require("./src/es-observable.js");
const { runTests } = require("@lrowe/es-observable/commonjs/test/default.js");

process.on("uncaughtException", err => {
  // Errors thrown by the spec tests have no message, rethrow anything else.
  if (err.message) {
    throw err;
  }
  /* eslint-disable no-console */
  console.warn("uncaughtException: ignored deferred exception from tests");
});

// Capture logged lines so we can inspect the output.
const orig = console.log;
const logged = [];
console.log = function hookedLog(...args) {
  orig(...args);
  logged.push(String(args));
};

runTests(Observable);

process.on("exit", () => {
  /* eslint-disable no-control-regex */
  const colors = /\x1B\[[0-9;]*m/g;
  console.log = orig;
  const lines = logged.map(msg => msg.replace(colors, ""));
  const i = lines.findIndex(line => line.includes("Passed"));
  const failures = lines
    .slice(i + 1)
    .filter(line => line && !line.startsWith(" "));
  const ignore = [
    "Observable constructor > Observable.prototype has a constructor property > Function length is 1",
    "Observable.prototype.subscribe > Observable.prototype has a subscribe property > Function length is 1",
    "Observable.prototype.subscribe > Subscriber arguments > Subscription observer's constructor property is Object",
    "Observable.prototype.subscribe > Returns a subscription object > Contructor property is Object"
  ];
  const unexpected = failures.filter(line => !ignore.includes(line));
  if (unexpected.length) {
    console.error("Unexpected failures", unexpected);
    throw new Error("Unexpected failures");
  }
});
