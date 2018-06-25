// @flow
"use strict";
export type {
  IDisposable,
  IClassicObservable as IObservable,
  IClassicSubscriptionObserver as IObserver,
  ClassicObserver as PartialObserver
} from "./classic-observable";

module.exports.Observable = require("./classic-observable").Observable;
module.exports.map = require("./operators/map").map;
module.exports.reduce = require("./operators/reduce").reduce;
module.exports.concatMap = require("./operators/concatMap").concatMap;
module.exports.concatAll = require("./operators/concatAll").concatAll;
module.exports.mergeMap = require("./operators/mergeMap").mergeMap;
module.exports.mergeAll = require("./operators/mergeAll").mergeAll;
module.exports.expand = require("./operators/expand").expand;
module.exports.tap = require("./operators/tap").tap;
module.exports.concat = require("./operators/concat").concat;
module.exports.catchError = require("./operators/catchError").catchError;
module.exports.defaultIfEmpty = require("./operators/defaultIfEmpty").defaultIfEmpty;
module.exports.dematerialize = require("./operators/dematerialize").dematerialize;
module.exports.materialize = require("./operators/materialize").materialize;
module.exports.filter = require("./operators/filter").filter;
module.exports.toArray = require("./operators/toArray").toArray;
