// @flow
/* eslint-disable no-undefined */
"use strict";

const symbolObservable = require("symbol-observable").default;

export interface ISubscriptionObserver<T, E = Error> {
  next(value: T): void,
  error(errorValue: E): void,
  complete(): void,
  +closed: boolean
}

export interface ISubscription {
  unsubscribe(): void,
  +closed: boolean
}

type Cleanup = ?{ +unsubscribe: () => void } | (() => void);

export type SubscriberFunction<T, E = Error> = (
  observer: ISubscriptionObserver<T, E>
) => Cleanup;

export type Observer<T, E = Error> = {
  +start?: ?(subscription: ISubscription) => void,
  +next?: ?(value: T) => void,
  +error?: ?(errorValue: E) => void,
  +complete?: ?() => void
};

export interface IAdaptsToObservable<T, E = Error> {
  // Flow cannot parse computed properties.
  //[symbolObservable](): IObservable<T, E>
}

export interface IObservable<T, E = Error> extends IAdaptsToObservable<T, E> {
  subscribe(
    observerOrOnNext: ?Observer<T, E> | ((value: T) => void),
    onError: ?(errorValue: E) => void,
    onComplete: ?() => void
  ): ISubscription
}

// Error policy.

type TryCatch = <A, B, R>(f: (A, B) => R, a: A, b: B) => R | typeof errorObject;

const errorObject = { e: undefined };

function reportError(e: Error): void {
  // See https://github.com/ReactiveX/rxjs/issues/3004#issuecomment-339720668
  setImmediate(function reportErrorImmediate() {
    throw e;
  });
}

function doTryCatch<A, B, R>(
  f: (A, B) => R,
  a: A,
  b: B
): R | typeof errorObject {
  try {
    return f(a, b);
  } catch (e) {
    errorObject.e = e;
    return errorObject;
  }
}

function dontTryCatch<A, B, R>(
  f: (A, B) => R,
  a: A,
  b: B
): R | typeof errorObject {
  return f(a, b);
}

let tryCatch: TryCatch = doTryCatch;

function shouldCatchErrors(shouldCatch: boolean): void {
  tryCatch = shouldCatch ? doTryCatch : dontTryCatch;
}

// Functions to be called within tryCatch().

function callNext<T, E>(observer: Observer<T, E>, value: T): void {
  const { next } = observer;
  if (typeof next === "function") {
    next.call(observer, value);
  }
}

function callError<T, E>(observer: Observer<T, E>, errorValue: E): void {
  const { error } = observer;
  if (typeof error === "function") {
    error.call(observer, errorValue);
  }
}

function callComplete<T, E>(observer: Observer<T, E>, _: void): void {
  const { complete } = observer;
  if (typeof complete === "function") {
    complete.call(observer);
  }
}

function callStart<T, E>(
  observer: Observer<T, E>,
  subscription: Subscription<T, E>
): void {
  const { start } = observer;
  if (typeof start === "function") {
    start.call(observer, subscription);
  }
}

function callSubscriber<T, E>(
  subscriber: SubscriberFunction<T, E>,
  subscriptionObserver: ISubscriptionObserver<T, E>
): Cleanup {
  return subscriber(subscriptionObserver);
}

function callCleanup<T, E>(subscription: Subscription<T, E>, _: void) {
  const cleanup = subscription._cleanup;
  if (typeof cleanup === "function") {
    subscription._cleanup = undefined;
    cleanup();
  } else if (typeof cleanup === "object" && cleanup !== null) {
    subscription._cleanup = undefined;
    cleanup.unsubscribe();
  }
}

class SubscriptionObserver<T, E = Error>
  implements ISubscriptionObserver<T, E> {
  _subscription: Subscription<T, E>;

  constructor(subscription: Subscription<T, E>): void {
    this._subscription = subscription;
  }

  next(value: T): void {
    const subscription = this._subscription;
    const observer = subscription._observer;
    if (typeof observer === "undefined") {
      return;
    }
    const result = tryCatch(callNext, observer, value);
    if (result === errorObject) {
      reportError(errorObject.e);
      errorObject.e = undefined;
    }
  }

  error(errorValue: E): void {
    const subscription = this._subscription;
    const observer = subscription._observer;
    if (typeof observer === "undefined") {
      return;
    }
    subscription._observer = undefined;
    const result = tryCatch(callError, observer, errorValue);
    if (result === errorObject) {
      reportError(errorObject.e);
      errorObject.e = undefined;
    }
    const cleanupResult = tryCatch(callCleanup, subscription);
    if (cleanupResult === errorObject) {
      reportError(errorObject.e);
      errorObject.e = undefined;
    }
  }

  complete(): void {
    const subscription = this._subscription;
    const observer = subscription._observer;
    if (typeof observer === "undefined") {
      return;
    }
    subscription._observer = undefined;
    const result = tryCatch(callComplete, observer);
    if (result === errorObject) {
      reportError(errorObject.e);
      errorObject.e = undefined;
    }
    const cleanupResult = tryCatch(callCleanup, subscription);
    if (cleanupResult === errorObject) {
      reportError(errorObject.e);
      errorObject.e = undefined;
    }
  }

  get closed(): boolean {
    return typeof this._subscription._observer === "undefined";
  }
}

class Subscription<T, E = Error> implements ISubscription {
  _observer: Observer<T, E> | void;
  _cleanup: Cleanup;

  constructor(
    subscriber: SubscriberFunction<T, E>,
    observer: Observer<T, E>
  ): void {
    this._observer = observer;
    const startResult = tryCatch(callStart, observer, this);
    if (startResult === errorObject) {
      reportError(errorObject.e);
      errorObject.e = undefined;
    }
    if (typeof this._observer === "undefined") {
      return;
    }
    const subscriptionObserver = new SubscriptionObserver(this);
    const subscriberResult = tryCatch(
      callSubscriber,
      subscriber,
      subscriptionObserver
    );
    if (subscriberResult === errorObject) {
      subscriptionObserver.error(errorObject.e);
      errorObject.e = undefined;
      return;
    }
    const cleanup: Cleanup = (subscriberResult: any);
    if (cleanup === null || typeof cleanup === "undefined") {
      return;
    }
    if (typeof cleanup !== "function" && typeof cleanup !== "object") {
      throw new TypeError(
        "unexpected subscriber result type " + typeof cleanup
      );
    }
    if (
      typeof cleanup === "object" &&
      typeof cleanup.unsubscribe !== "function"
    ) {
      throw new TypeError("expected unsubscribe property to be a function");
    }
    this._cleanup = cleanup;
    if (typeof this._observer === "undefined") {
      const cleanupResult = tryCatch(callCleanup, this);
      if (cleanupResult === errorObject) {
        reportError(errorObject.e);
        errorObject.e = undefined;
      }
    }
  }

  unsubscribe(): void {
    const observer = this._observer;
    if (typeof observer === "undefined") {
      return;
    }
    this._observer = undefined;
    const cleanupResult = tryCatch(callCleanup, this);
    if (cleanupResult === errorObject) {
      reportError(errorObject.e);
      errorObject.e = undefined;
    }
  }

  get closed(): boolean {
    return typeof this._observer === "undefined";
  }
}

class BaseObservable<T, E = Error> {
  _subscriber: SubscriberFunction<T, E>;

  constructor(subscriber: SubscriberFunction<T, E>): void {
    if (typeof subscriber !== "function") {
      throw new TypeError("Function expected");
    }
    this._subscriber = subscriber;
  }

  static of(...values: T[]): this {
    return new this(observer => {
      for (const value of values) {
        observer.next(value);
      }
      observer.complete();
    });
  }

  static from(obsOrIter: IAdaptsToObservable<T, E> | Iterable<T>): this {
    if (typeof obsOrIter === "undefined" || obsOrIter === null) {
      throw new TypeError();
    }

    if (typeof obsOrIter === "object") {
      const observableProp: ?() => IObservable<T, E> =
        // $FlowFixMe: No symbol support.
        obsOrIter[symbolObservable];
      if (typeof observableProp === "function") {
        const observable = observableProp.call(obsOrIter);
        if (typeof observable !== "object" || observable === null) {
          throw new TypeError();
        }
        if (observable.constructor === this) {
          return (observable: any);
        }
        // Avoid additional wrapping between compatible observable implementations.
        if (observable instanceof BaseObservable) {
          return new this(observable._subscriber);
        }
        return new this(observer => observable.subscribe(observer));
      }
    }

    // $FlowFixMe: No symbol support.
    if (typeof obsOrIter[Symbol.iterator] === "function") {
      return new this(observer => {
        // $FlowFixMe: No symbol support.
        for (const value of (obsOrIter: Iterable<T>)) {
          observer.next(value);
        }
        observer.complete();
      });
    }

    throw new TypeError();
  }

  static empty(): this {
    return new this(observer => {
      observer.complete();
    });
  }

  static throw(errorValue: E): this {
    return new this(observer => {
      observer.error(errorValue);
    });
  }
}

class EsObservable<T, E = Error> extends BaseObservable<T, E>
  implements IObservable<T, E> {
  subscribe(
    observerOrOnNext: ?Observer<T, E> | ((value: T) => void),
    onError: ?(errorValue: E) => void,
    onComplete: ?() => void
  ): ISubscription {
    const observer =
      typeof observerOrOnNext === "object" && observerOrOnNext !== null
        ? observerOrOnNext
        : {
            next: observerOrOnNext,
            error: onError,
            complete: onComplete
          };
    return new Subscription(this._subscriber, observer);
  }

  // $FlowFixMe: No symbol or computed property support.
  [symbolObservable](): this {
    return this;
  }

  static of(...values: T[]): this {
    const C = typeof this === "function" ? this : (EsObservable: any);
    return super.of.call(C, ...values);
  }

  static from(obsOrIter: IAdaptsToObservable<T, E> | Iterable<T>): this {
    const C = typeof this === "function" ? this : (EsObservable: any);
    return super.from.call(C, obsOrIter);
  }
}

module.exports = {
  BaseObservable,
  Observable: EsObservable,
  Subscription,
  shouldCatchErrors
};
