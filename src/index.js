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

const { Observable } = require("./classic-observable");
const operators = require("./operators");

module.exports = { Observable, operators };
