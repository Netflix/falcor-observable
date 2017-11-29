// @flow
"use strict";

const symbolObservable = require("symbol-observable").default;
const {
  tryCatch,
  tryCatchResult,
  symbolError,
  popError
} = require("./try-catch");
const { ClassicFromEsSubscriptionObserver } = require("./classic-observer");
import type { IClassicObservable } from "./classic-observable";

export interface ISubscriptionObserver<T, E = Error> {
  next(value: T): void;
  error(errorValue: E): void;
  complete(): void;
  +closed: boolean;
}

export interface ISubscription {
  unsubscribe(): void;
  +closed: boolean;
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
type ObservableFrom<T, E> =
  | IAdaptsToObservable<T, E>
  | Iterable<T>
  | IClassicObservable<T, E>;

export interface IObservable<T, E = Error> extends IAdaptsToObservable<T, E> {
  subscribe(
    observerOrOnNext: ?Observer<T, E> | ((value: T) => void),
    onError: ?(errorValue: E) => void,
    onComplete: ?() => void
  ): ISubscription;
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

function callComplete<T, E>(observer: Observer<T, E>): void {
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

function callCleanup<T, E>(subscription: Subscription<T, E>) {
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
    tryCatch(callNext, observer, value);
  }

  error(errorValue: E): void {
    const subscription = this._subscription;
    const observer = subscription._observer;
    if (typeof observer === "undefined") {
      return;
    }
    subscription._observer = undefined;
    tryCatch(callError, observer, errorValue);
    tryCatch(callCleanup, subscription);
  }

  complete(): void {
    const subscription = this._subscription;
    const observer = subscription._observer;
    if (typeof observer === "undefined") {
      return;
    }
    subscription._observer = undefined;
    tryCatch(callComplete, observer);
    tryCatch(callCleanup, subscription);
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
    tryCatch(callStart, observer, this);
    if (typeof this._observer === "undefined") {
      return;
    }
    const subscriptionObserver = new SubscriptionObserver(this);
    const subscriberResult = tryCatchResult(subscriber, subscriptionObserver);
    if (subscriberResult === symbolError) {
      // XXX implies E must always be Error.
      subscriptionObserver.error((popError(): any));
      return;
    }
    const cleanup: Cleanup = subscriberResult;
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
      tryCatch(callCleanup, this);
    }
  }

  unsubscribe(): void {
    const observer = this._observer;
    if (typeof observer === "undefined") {
      return;
    }
    this._observer = undefined;
    tryCatch(callCleanup, this);
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

  static from(obsOrIter: ObservableFrom<T, E>): this {
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

    // Not to spec
    if (typeof obsOrIter.subscribe === "function") {
      const classicObservable: IClassicObservable<T, E> = (obsOrIter: any);
      return new this(observer => {
        const disposable = classicObservable.subscribe(
          new ClassicFromEsSubscriptionObserver(observer)
        );
        return () => disposable.dispose();
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

  static from(obsOrIter: ObservableFrom<T, E>): this {
    const C = typeof this === "function" ? this : (EsObservable: any);
    return super.from.call(C, obsOrIter);
  }
}

module.exports = {
  BaseObservable,
  Observable: EsObservable,
  Subscription
};
