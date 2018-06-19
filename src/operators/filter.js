// @flow
"use strict";

import type { OperatorFunction } from "../es-observable";
const { Observable } = require("../es-observable.js");
const { tryCatchResult, symbolError, popError } = require("../try-catch");

function filter<T, E>(
  predicate: (value: T, i: number) => boolean,
  thisArg?: any
): OperatorFunction<T, T, E> {
  return function mapOperator(source: Observable<T, E>): Observable<T, E> {
    return new Observable(observer => {
      let index = 0;
      return source.subscribe({
        next(v) {
          const result = tryCatchResult.call(thisArg, predicate, v, index++);
          if (result === symbolError) {
            observer.error((popError(): any));
            return;
          }
          if (result) {
            observer.next(v);
          }
        },
        error(e) {
          observer.error(e);
        },
        complete() {
          observer.complete();
        }
      });
    });
  };
}

module.exports = { filter };
