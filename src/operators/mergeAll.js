// @flow
"use strict";

import type { ObservableInput, OperatorFunction } from "../es-observable.js";
const { _mergeMap } = require("./mergeMap");

function mergeAll<T, E>(
  concurrent?: number
): OperatorFunction<ObservableInput<T, E>, T, E> {
  return _mergeMap(undefined, undefined, concurrent);
}

module.exports = { mergeAll };
