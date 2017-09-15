// @flow
"use strict";
export interface IDisposable { dispose(): void }

export interface IObservable<T> {
  subscribe(
    onNext: ?PartialObserver<T> | ((value: T) => void),
    onError: ?(error: Error) => void,
    onCompleted: ?() => void
  ): IDisposable
}

export interface IObserver<T> {
  onNext(value: T): void,
  onError(error: Error): void,
  onCompleted(): void
}

export type PartialObserver<T> = {
  +onNext?: (value: T) => void,
  +onError?: (error: Error) => void,
  +onCompleted?: () => void
};

interface ISubscriptionObserver<T> extends IObserver<T> {
  _closed: boolean
}

class FunctionsSubscriptionObserver<T> implements ISubscriptionObserver<T> {
  _closed: boolean;
  _onNext: ?(value: T) => void;
  _onError: ?(error: Error) => void;
  _onCompleted: ?() => void;

  constructor(
    onNext: ?(value: T) => void,
    onError: ?(error: Error) => void,
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

  onError(error: Error): void {
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

class PartialSubscriptionObserver<T> implements ISubscriptionObserver<T> {
  _closed: boolean;
  _partial: PartialObserver<T>;

  constructor(partial: PartialObserver<T>): void {
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

  onError(error: Error): void {
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

class Subscription<T> implements IDisposable {
  _observer: ISubscriptionObserver<T>;
  _subscription: ?IDisposable | (() => void);

  constructor(
    subscribe: (observer: IObserver<T>) => ?IDisposable | (() => void),
    observerOrOnNext: ?PartialObserver<T> | ((value: T) => void),
    onError: ?(error: Error) => void,
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

class Observable<T> implements IObservable<T> {
  _subscribe: (observer: IObserver<T>) => ?IDisposable | (() => void);

  constructor(
    subscribe: (observer: IObserver<T>) => ?IDisposable | (() => void)
  ): void {
    this._subscribe = subscribe;
  }

  subscribe(
    observerOrOnNext: ?PartialObserver<T> | ((value: T) => void),
    onError: ?(error: Error) => void,
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
    subscribe: (observer: IObserver<T>) => ?IDisposable | (() => void)
  ): IObservable<T> {
    return new this(subscribe);
  }

  static empty(): IObservable<T> {
    return this.create(observer => {
      observer.onCompleted();
    });
  }

  static of(...values: T[]): IObservable<T> {
    return this.create(observer => {
      for (const value of values) {
        observer.onNext(value);
      }
      observer.onCompleted();
    });
  }

  static throw(error: Error): IObservable<T> {
    return this.create(observer => {
      observer.onError(error);
    });
  }
}

module.exports = { Observable };
