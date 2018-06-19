// @flow
"use strict";

import type { OperatorFunction } from "../es-observable";
const { Observable } = require("../es-observable");

function defaultIfEmpty<T, R, E>(
  defaultValue: R
): OperatorFunction<T, T | R, E> {
  return function defaultIfEmptyOperator(
    source: Observable<T, E>
  ): Observable<T | R, E> {
    return new Observable(observer => {
      let seenValue = false;
      return source.subscribe({
        next(v) {
          seenValue = true;
          observer.next(v);
        },
        error(e) {
          observer.error(e);
        },
        complete() {
          if (!seenValue) {
            observer.next(defaultValue);
          }
          observer.complete();
        }
      });
    });
  };
}

module.exports = { defaultIfEmpty };
