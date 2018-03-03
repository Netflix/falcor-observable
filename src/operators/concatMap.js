// @flow
"use strict";

import type { ObservableInput, OperatorFunction } from "../es-observable.js";
const { _mergeMap } = require("./mergeMap");

declare function concatMap<T, R, E>(
  project: (value: T, i: number) => ObservableInput<R, E>
): OperatorFunction<T, R, E>;

declare function concatMap<T, I, R, E>(
  project: (value: T, i: number) => ObservableInput<I, E>,
  resultSelector: (
    outerValue: T,
    innerValue: I,
    outerIndex: number,
    innerIndex: number
  ) => ObservableInput<R, E>
): OperatorFunction<T, R, E>;

function concatMap(project, resultSelector) {
  return _mergeMap(project, resultSelector, 1);
}

module.exports = { concatMap };
