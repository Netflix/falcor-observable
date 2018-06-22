// @flow
"use strict";
import type {
  OperatorFunction,
  ISubscription,
  ObservableInput
} from "../es-observable";
const { Observable } = require("../es-observable");

function concat<T, E: Error>(
  ...observables: ObservableInput<T, E>[]
): OperatorFunction<T, T, E> {
  return function concatOperator(source: Observable<T, E>): Observable<T, E> {
    const clonedObservables = [
      source,
      ...observables.map(o => Observable.from(o))
    ];

    return new Observable(observer => {
      let currentSub: ?ISubscription = null;
      function recur(index) {
        if (index >= clonedObservables.length) {
          observer.complete();
          return;
        }
        clonedObservables[index].subscribe({
          start(sub) {
            currentSub = sub;
          },
          next(v) {
            observer.next(v);
          },
          error(e) {
            observer.error(e);
          },
          complete() {
            recur(index + 1);
          }
        });
      }

      recur(0);

      return () => {
        if (currentSub) {
          currentSub.unsubscribe();
        }
      };
    });
  };
}

module.exports = { concat };
