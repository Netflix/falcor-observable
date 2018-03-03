// @flow
"use strict";

import type { ObservableInput, OperatorFunction } from "../es-observable.js";
const { _mergeMap } = require("./mergeMap");

function concatAll<T, E>(): OperatorFunction<ObservableInput<T, E>, T, E> {
  return _mergeMap(undefined, undefined, 1);
}

module.exports = { concatAll };
