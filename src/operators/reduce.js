// @flow
"use strict";

import type { OperatorFunction } from "../es-observable";
const { Observable } = require("../es-observable.js");
const { tryCatchResult, symbolError, popError } = require("../try-catch");

declare function reduce<T, R, E>(
  accumulator: (acc: R, value: T, i: number) => R,
  seed: R
): OperatorFunction<T, R, E>;

declare function reduce<T, E>(
  accumulator: (acc: T, value: T, i: number) => T
): OperatorFunction<T, T, E>;

function reduce(accumulator, seed) {
  const hasSeed = arguments.length > 1;
  return function reduceOperator(source) {
    return new Observable(observer => {
      let index = 0;
      let acc = seed;
      return source.subscribe({
        next(v) {
          if (index === 0 && !hasSeed) {
            acc = v;
            index++;
            return;
          }
          const result = tryCatchResult(accumulator, acc, v, index++);
          if (result === symbolError) {
            observer.error((popError(): any));
            return;
          }
          acc = result;
        },
        error(e) {
          observer.error(e);
        },
        complete() {
          if (index !== 0 || hasSeed) {
            observer.next(acc);
          }
          observer.complete();
        }
      });
    });
  };
}

module.exports = { reduce };
