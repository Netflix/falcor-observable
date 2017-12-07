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

module.exports.Operators = require("./classic-observable").Observable;
module.exports.map = require("./operators/map").map;
