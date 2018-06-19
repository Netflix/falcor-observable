// @flow
"use strict";
import type {
  ObservableInput,
  OperatorFunction,
  ISubscription
} from "../es-observable";
const { Observable } = require("../es-observable");
const { tryCatchResult, symbolError, popError } = require("../try-catch");

function catchError<T, R, E>(
  selector: (err: E, caught: Observable<T, E>) => ObservableInput<R, E>
): OperatorFunction<T, T | R, E> {
  return function catchErrorOperatorFunction(
    source: Observable<T, E>
  ): Observable<T | R, E> {
    return new Observable(observer => {
      let currentSub: ?ISubscription = null;
      source.subscribe({
        start(sub) {
          currentSub = sub;
        },
        next(v) {
          observer.next(v);
        },
        error(e) {
          const result = tryCatchResult(selector, e, source);
          if (result === symbolError) {
            observer.error((popError(): any));
            return;
          }
          const obs = Observable.from(result);
          currentSub = obs.subscribe(observer);
        },
        complete() {
          observer.complete();
        }
      });
      return () => {
        if (currentSub) {
          currentSub.unsubscribe();
        }
      };
    });
  };
}

module.exports = { catchError };
