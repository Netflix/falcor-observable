// @flow
"use strict";

import type { OperatorFunction } from "../es-observable";
const { Observable } = require("../es-observable");

export type Notification<T, E = Error> =
  | { kind: "N", value: T }
  | { kind: "E", error: E }
  | { kind: "C" };

function materialize<T, E>(): OperatorFunction<T, Notification<T, E>, E> {
  return function materializeOperator(
    source: Observable<T, E>
  ): Observable<Notification<T, E>, E> {
    return new Observable(observer =>
      source.subscribe({
        next(value) {
          observer.next({ kind: "N", value });
        },
        error(error) {
          observer.next({ kind: "E", error });
          observer.complete();
        },
        complete() {
          observer.next({ kind: "C" });
          observer.complete();
        }
      })
    );
  };
}

module.exports = { materialize };
