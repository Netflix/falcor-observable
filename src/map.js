// @flow
/* eslint-disable no-undefined */

import type {
  IObservable,
  ISubscriptionObserver,
  ISubscription
} from './es-observable.js';
const { Observable } = require('./es-observable.js');

module.exports = function map<T,R,E>(projection: (T, number, IObservable<T, E>) => R): (IObservable<T, E> => IObservable<R, E>) {
  return function mapOperator(that: IObservable<T,E>): IObservable<R, E> {
    return new Observable(observer => {
      let index: number = 0;
      return that.subscribe({
        next(v) {
          observer.next(projection(v, index++, that));
        },
        error(e) {
          observer.error(e);
        },
        complete() {
          observer.complete();
        }
      })
    });
  };
};
