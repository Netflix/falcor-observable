// @flow
"use strict";
export type {
  IDisposable,
  IClassicObservable as IObservable,
  ClassicObserver as PartialObserver
} from "./classic-observable";
export type {
  IClassicSubscriptionObserver as IObserver
} from "./classic-observer";

module.exports.Observable = require("./classic-observable").Observable;
module.exports.map = require("./operators/map").map;
module.exports.reduce = require("./operators/reduce").reduce;
module.exports.concatMap = require("./operators/concatMap").concatMap;
module.exports.concatAll = require("./operators/concatAll").concatAll;
module.exports.mergeMap = require("./operators/mergeMap").mergeMap;
module.exports.mergeAll = require("./operators/mergeAll").mergeAll;
