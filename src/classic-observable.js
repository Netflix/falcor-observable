// @flow
/* eslint-disable no-undefined */
"use strict";

const symbolObservable = require("symbol-observable").default;
const {
  BaseObservable,
  Observable: EsObservable,
  Subscription
} = require("./es-observable");

import type {
  IAdaptsToObservable,
  IObservable,
  ISubscriptionObserver,
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

  static fromClassicObservable(
    classicObservable: IClassicObservable<T, E>
  ): this {
    const C = typeof this === "function" ? this : (ClassicObservable: any);
    const observableProp: ?() => IObservable<T, E> =
      // $FlowFixMe: No symbol support.
      classicObservable[symbolObservable];
    if (typeof observableProp === "function") {
      return C.from(classicObservable);
    }
    return C.create(classicObserver =>
      classicObservable.subscribe(classicObserver)
    );
  }
}

function pipe(input, ...operators) {
  const C = typeof this === "function" ? this : (ClassicObservable: any);
  return C.from(EsObservable.pipe(C.fromClassicObservable(input), ...operators));
}

ClassicObservable.pipe = pipe;

module.exports = { Observable: ClassicObservable };
