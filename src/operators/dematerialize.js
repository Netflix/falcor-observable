// @flow
"use strict";

import type { OperatorFunction } from "../es-observable";
import type { Notification } from "./materialize";
const { Observable } = require("../es-observable");

function dematerialize<T, E>(): OperatorFunction<Notification<T, E>, T, E> {
  return function dematerializeOperator(
    source: Observable<Notification<T, E>, E>
  ): Observable<T, E> {
    return new Observable(observer =>
      source.subscribe({
        next(note) {
          if (note) {
            switch (note.kind) {
              case "N":
                return observer.next(note.value);
              case "E":
                return observer.error(note.error);
              case "C":
                return observer.complete();
              default:
                break;
            }
          }
          throw new Error("unexpected notification kind value");
        },
        error(e) {
          observer.error(e);
        },
        complete() {
          observer.complete();
        }
      })
    );
  };
}

module.exports = { dematerialize };
