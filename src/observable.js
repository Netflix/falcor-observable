// @flow
"use strict";
export interface IDisposable { dispose(): void }

export interface IObservable<T, E = Error> {
  subscribe(
    onNext: ?PartialObserver<T, E> | ((value: T) => void),
    onError: ?(error: E) => void,
    onCompleted: ?() => void
  ): IDisposable
}

export interface IObserver<T, E = Error> {
  onNext(value: T): void,
  onError(error: E): void,
  onCompleted(): void
}

export type PartialObserver<T, E = Error> = {
  +onNext?: (value: T) => void,
  +onError?: (error: E) => void,
  +onCompleted?: () => void
};

interface ISubscriptionObserver<T, E = Error> extends IObserver<T, E> {
  _closed: boolean
}

class FunctionsSubscriptionObserver<T, E = Error>
  implements ISubscriptionObserver<T, E> {
  _closed: boolean;
  _onNext: ?(value: T) => void;
  _onError: ?(error: E) => void;
  _onCompleted: ?() => void;

  constructor(
    onNext: ?(value: T) => void,
    onError: ?(error: E) => void,
    onCompleted: ?() => void
  ): void {
    this._closed = false;
    this._onNext = onNext;
    this._onError = onError;
    this._onCompleted = onCompleted;
  }

  onNext(value: T): void {
    if (this._closed) {
      return;
    }
    const onNext = this._onNext;
    if (typeof onNext === "function") {
      onNext(value);
    }
  }

  onError(error: E): void {
    if (this._closed) {
      return;
    }
    this._closed = true;
    const onError = this._onError;
    if (typeof onError === "function") {
      onError(error);
    }
  }

  onCompleted(): void {
    if (this._closed) {
      return;
    }
    this._closed = true;
    const onCompleted = this._onCompleted;
    if (typeof onCompleted === "function") {
      onCompleted();
    }
  }
}

class PartialSubscriptionObserver<T, E = Error>
  implements ISubscriptionObserver<T, E> {
  _closed: boolean;
  _partial: PartialObserver<T, E>;

  constructor(partial: PartialObserver<T, E>): void {
    this._closed = false;
    this._partial = partial;
  }

  onNext(value: T): void {
    if (this._closed) {
      return;
    }
    const partial = this._partial;
    if (typeof partial.onNext === "function") {
      partial.onNext(value);
    }
  }

  onError(error: E): void {
    if (this._closed) {
      return;
    }
    this._closed = true;
    const partial = this._partial;
    if (typeof partial.onError === "function") {
      partial.onError(error);
    }
  }

  onCompleted(): void {
    if (this._closed) {
      return;
    }
    this._closed = true;
    const partial = this._partial;
    if (typeof partial.onCompleted === "function") {
      partial.onCompleted();
    }
  }
}

class Subscription<T, E = Error> implements IDisposable {
  _observer: ISubscriptionObserver<T, E>;
  _subscription: ?IDisposable | (() => void);

  constructor(
    subscribe: (observer: IObserver<T, E>) => ?IDisposable | (() => void),
    observerOrOnNext: ?PartialObserver<T, E> | ((value: T) => void),
    onError: ?(error: E) => void,
    onCompleted: ?() => void
  ): void {
    const observer =
      typeof observerOrOnNext === "object" && observerOrOnNext !== null
        ? new PartialSubscriptionObserver(observerOrOnNext)
        : new FunctionsSubscriptionObserver(
            observerOrOnNext,
            onError,
            onCompleted
          );
    this._observer = observer;
    this._subscription = subscribe(observer);
  }

  dispose(): void {
    const observer = this._observer;
    if (observer._closed) {
      return;
    }
    observer._closed = true;
    const subscription = this._subscription;
    if (typeof subscription === "function") {
      subscription();
    } else if (typeof subscription !== "undefined" && subscription !== null) {
      subscription.dispose();
    }
  }
}

class Observable<T, E = Error> implements IObservable<T, E> {
  _subscribe: (observer: IObserver<T, E>) => ?IDisposable | (() => void);

  constructor(
    subscribe: (observer: IObserver<T, E>) => ?IDisposable | (() => void)
  ): void {
    this._subscribe = subscribe;
  }

  subscribe(
    observerOrOnNext: ?PartialObserver<T, E> | ((value: T) => void),
    onError: ?(error: E) => void,
    onCompleted: ?() => void
  ): IDisposable {
    return new Subscription(
      this._subscribe,
      observerOrOnNext,
      onError,
      onCompleted
    );
  }

  static create(
    subscribe: (observer: IObserver<T, E>) => ?IDisposable | (() => void)
  ): IObservable<T, E> {
    return new this(subscribe);
  }

  static empty(): IObservable<T, E> {
    return this.create(observer => {
      observer.onCompleted();
    });
  }

  static of(...values: T[]): IObservable<T, E> {
    return this.create(observer => {
      for (const value of values) {
        observer.onNext(value);
      }
      observer.onCompleted();
    });
  }

  static throw(error: E): IObservable<T, E> {
    return this.create(observer => {
      observer.onError(error);
    });
  }
}

module.exports = { Observable };
