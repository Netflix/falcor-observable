// @flow
"use strict";

import type { ISubscriptionObserver, ISubscription } from "../es-observable.js";
const { Observable } = require("../es-observable.js");
const { tryCatchResult, symbolError, popError } = require("../try-catch");

function map<T, R, E: Error>(
  project: (T, number) => R,
  thisArg?: any
): (Observable<T, E>) => Observable<R, E> {
  return function mapOperator(source: Observable<T, E>): Observable<R, E> {
    return new Observable(observer => {
      let index: number = 0;
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
