// @flow
"use strict";

const symbolObservable = require("symbol-observable").default;
const {
  BaseObservable,
  Observable: EsObservable,
  Subscription
} = require("./es-observable");
const { ClassicFromEsSubscriptionObserver } = require("./classic-observer");

import type {
  IAdaptsToObservable,
  IObservable,
  ISubscription
} from "./es-observable";

export interface IDisposable {
  dispose(): void;
  +isDisposed: boolean;
}

export interface IClassicSubscriptionObserver<T, E = Error> {
  onNext(value: T): void;
  onError(error: E): void;
  onCompleted(): void;
  +isStopped: boolean;
}

export type ClassicObserver<T, E = Error> = {
  +onNext?: (value: T) => void,
  +onError?: (error: E) => void,
  +onCompleted?: () => void
};

export interface IClassicObservable<T, E = Error> {
  subscribe(
    onNext: ?ClassicObserver<T, E> | ((value: T) => void),
    onError: ?(error: E) => void,
    onCompleted: ?() => void
  ): IDisposable;
}

type ClassicCleanup = ?{ +dispose: () => void } | (() => void);

export type ClassicSubscriberFunction<T, E = Error> = (
  observer: IClassicSubscriptionObserver<T, E>
) => ClassicCleanup;

class EsFromClassicObserver<T, E = Error> {
  _observer: ClassicObserver<T, E>;
  constructor(observer: ClassicObserver<T, E>): void {
    this._observer = observer;
  }
  next(value: T): void {
    const observer = this._observer;
    const { onNext } = observer;
    if (typeof onNext === "function") {
      onNext.call(observer, value);
    }
  }
  error(errorValue: E): void {
    const observer = this._observer;
    const { onError } = observer;
    if (typeof onError === "function") {
      onError.call(observer, errorValue);
    }
  }
  complete(): void {
    const observer = this._observer;
    const { onCompleted } = observer;
    if (typeof onCompleted === "function") {
      onCompleted.call(observer);
    }
  }
}

// XXX Should these go directly on Subscription?
class DisposableFromSubscription implements IDisposable {
  _subscription: ISubscription;
  constructor(subscription: ISubscription): void {
    this._subscription = subscription;
  }
  dispose(): void {
    this._subscription.unsubscribe();
  }
  get isDisposed(): boolean {
    return this._subscription.closed;
  }
}

class ClassicObservable<T, E = Error> extends BaseObservable<T, E>
  implements IClassicObservable<T, E>, IAdaptsToObservable<T, E> {
  subscribe(
    observerOrOnNext: ?ClassicObserver<T, E> | ((value: T) => void),
    onError: ?(error: E) => void,
    onCompleted: ?() => void
  ): IDisposable {
    const observer =
      typeof observerOrOnNext === "object" && observerOrOnNext !== null
        ? new EsFromClassicObserver(observerOrOnNext)
        : {
            next: observerOrOnNext,
            error: onError,
            complete: onCompleted
          };
    const subscription = new Subscription(this._subscriber, observer);
    return new DisposableFromSubscription(subscription);
  }

  // $FlowFixMe: No symbol or computed property support.
  [symbolObservable](): IObservable<T, E> {
    return new EsObservable(this._subscriber);
  }

  static create(subscriber: ClassicSubscriberFunction<T, E>): this {
    const C = typeof this === "function" ? this : (ClassicObservable: any);
    if (typeof subscriber !== "function") {
      throw new TypeError("Function expected");
    }
    return new C(observer => {
      const oldObserver = new ClassicFromEsSubscriptionObserver(observer);
      const cleanup = subscriber(oldObserver);
      if (typeof cleanup !== "object" || cleanup === null) {
        return cleanup;
      }
      if (typeof cleanup.dispose === "function") {
        return () => {
          cleanup.dispose();
        };
      }
      // Will cause constructor to throw
      return ({ unsubscribe: cleanup.dispose }: any);
    });
  }
}

module.exports = { Observable: ClassicObservable };
