// @flow
"use strict";

import type { OperatorFunction } from "../es-observable";
const { Observable } = require("../es-observable.js");
const { tryCatchResult, symbolError, popError } = require("../try-catch");

function map<T, R, E>(
  project: (value: T, i: number) => R,
  thisArg?: any
): OperatorFunction<T, R, E> {
  return function mapOperator(source: Observable<T, E>): Observable<R, E> {
    return new Observable(observer => {
      let index = 0;
      return source.subscribe({
        next(v) {
          const result = tryCatchResult.call(thisArg, project, v, index++);
          if (result === symbolError) {
            observer.error((popError(): any));
            return;
          }
          observer.next(result);
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

module.exports = { map };
