// @flow
"use strict";
export type {
  IDisposable,
  IClassicObservable as IObservable,
  IClassicSubscriptionObserver as IObserver,
  ClassicObserver as PartialObserver
} from "./classic-observable";

const { Observable } = require("./classic-observable");

module.exports = { Observable };
