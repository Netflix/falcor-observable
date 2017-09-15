// @flow
"use strict";
export type {
  IDisposable,
  IObservable,
  IObserver,
  PartialObserver
} from "./observable";

const { Observable } = require("./observable");

module.exports = { Observable };
