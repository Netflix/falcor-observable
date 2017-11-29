// @flow
/* eslint-disable no-undefined */
"use strict";

import type { ISubscriptionObserver } from "./es-observable";

export interface IClassicSubscriptionObserver<T, E = Error> {
  onNext(value: T): void;
  onError(error: E): void;
  onCompleted(): void;
  +isStopped: boolean;
}

// XXX Should these go directly on SubscriptionObserver?
class ClassicFromEsSubscriptionObserver<T, E = Error>
  implements IClassicSubscriptionObserver<T, E> {
  _observer: ISubscriptionObserver<T, E>;
  constructor(observer: ISubscriptionObserver<T, E>): void {
    this._observer = observer;
  }
  onNext(value: T): void {
    this._observer.next(value);
  }
  onError(errorValue: E): void {
    this._observer.error(errorValue);
  }
  onCompleted(): void {
    this._observer.complete();
  }
  get isStopped(): boolean {
    return this._observer.closed;
  }
}

module.exports = { ClassicFromEsSubscriptionObserver };
