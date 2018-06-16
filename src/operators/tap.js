// @flow
"use strict";

import type { OperatorFunction } from "../es-observable";
const { Observable } = require("../es-observable");
const { tryCatchResult, symbolError, popError } = require("../try-catch");

function tap<T, E>(
  next: ?(value: T) => void,
  error: ?(value: E) => void,
  complete: ?() => void
): OperatorFunction<T, T, E> {
  return function tapOperator(source: Observable<T, E>): Observable<T, E> {
    return new Observable(observer =>
      source.subscribe(
        typeof next === "function"
          ? v => {
              const result = tryCatchResult(next, v);
              if (result === symbolError) {
                observer.error((popError(): any));
                return;
              }
              observer.next(v);
            }
          : v => observer.next(v),
        e => {
          if (typeof error === "function") {
            const result = tryCatchResult(error, e);
            if (result === symbolError) {
              observer.error((popError(): any));
              return;
            }
          }
          observer.error(e);
        },
        () => {
          if (typeof complete === "function") {
            const result = tryCatchResult(complete);
            if (result === symbolError) {
              observer.error((popError(): any));
              return;
            }
          }
          observer.complete();
        }
      )
    );
  };
}

module.exports = { tap };
