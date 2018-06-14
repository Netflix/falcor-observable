// @flow
"use strict";

const symbolObservable = require("symbol-observable").default;
const {
  BaseObservable,
  Observable: EsObservable,
  Subscription
} = require("./es-observable");
const { ClassicFromEsSubscriptionObserver } = require("./classic-observer");
const { tryCatchResult, symbolError, popError } = require("./try-catch");

import type {
  IAdaptsToObservable,
  IObservable,
  ISubscription,
  OperatorFunction
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

  static defer(factory: () => ClassicObservable<T, E>): this {
    return new this(observer => {
      const result = tryCatchResult(factory);
      if (result === symbolError) {
        return observer.error((popError(): any));
      }

      return EsObservable.fromClassicObservable(result).subscribe(observer);
    });
  }

  pipe: (() => ClassicObservable<T, E>) &
    (<R>(op1: OperatorFunction<T, R, E>) => ClassicObservable<R, E>) &
    (<R1, R2>(
      op1: OperatorFunction<T, R1, E>,
      op2: OperatorFunction<R1, R2, E>
    ) => ClassicObservable<R2, E>) &
    (<R1, R2, R3>(
      op1: OperatorFunction<T, R1, E>,
      op2: OperatorFunction<R1, R2, E>,
      op3: OperatorFunction<R2, R3, E>
    ) => ClassicObservable<R3, E>) &
    (<R1, R2, R3, R4>(
      op1: OperatorFunction<T, R1, E>,
      op2: OperatorFunction<R1, R2, E>,
      op3: OperatorFunction<R2, R3, E>,
      op4: OperatorFunction<R3, R4, E>
    ) => ClassicObservable<R4, E>) &
    (<R1, R2, R3, R4, R5>(
      op1: OperatorFunction<T, R1, E>,
      op2: OperatorFunction<R1, R2, E>,
      op3: OperatorFunction<R2, R3, E>,
      op4: OperatorFunction<R3, R4, E>,
      op5: OperatorFunction<R4, R5, E>
    ) => ClassicObservable<R5, E>) &
    (<R1, R2, R3, R4, R5, R6>(
      op1: OperatorFunction<T, R1, E>,
      op2: OperatorFunction<R1, R2, E>,
      op3: OperatorFunction<R2, R3, E>,
      op4: OperatorFunction<R3, R4, E>,
      op5: OperatorFunction<R4, R5, E>,
      op6: OperatorFunction<R5, R6, E>
    ) => ClassicObservable<R6, E>) &
    (<R1, R2, R3, R4, R5, R6, R7>(
      op1: OperatorFunction<T, R1, E>,
      op2: OperatorFunction<R1, R2, E>,
      op3: OperatorFunction<R2, R3, E>,
      op4: OperatorFunction<R3, R4, E>,
      op5: OperatorFunction<R4, R5, E>,
      op6: OperatorFunction<R5, R6, E>,
      op7: OperatorFunction<R6, R7, E>
    ) => ClassicObservable<R7, E>) &
    (<R1, R2, R3, R4, R5, R6, R7, R8>(
      op1: OperatorFunction<T, R1, E>,
      op2: OperatorFunction<R1, R2, E>,
      op3: OperatorFunction<R2, R3, E>,
      op4: OperatorFunction<R3, R4, E>,
      op5: OperatorFunction<R4, R5, E>,
      op6: OperatorFunction<R5, R6, E>,
      op7: OperatorFunction<R6, R7, E>,
      op8: OperatorFunction<R7, R8, E>
    ) => ClassicObservable<R8, E>) &
    (<R1, R2, R3, R4, R5, R6, R7, R8, R9>(
      op1: OperatorFunction<T, R1, E>,
      op2: OperatorFunction<R1, R2, E>,
      op3: OperatorFunction<R2, R3, E>,
      op4: OperatorFunction<R3, R4, E>,
      op5: OperatorFunction<R4, R5, E>,
      op6: OperatorFunction<R5, R6, E>,
      op7: OperatorFunction<R6, R7, E>,
      op8: OperatorFunction<R7, R8, E>,
      op9: OperatorFunction<R8, R9, E>
    ) => ClassicObservable<R9, E>) &
    (<R1, R2, R3, R4, R5, R6, R7, R8, R9, R10>(
      op1: OperatorFunction<T, R1, E>,
      op2: OperatorFunction<R1, R2, E>,
      op3: OperatorFunction<R2, R3, E>,
      op4: OperatorFunction<R3, R4, E>,
      op5: OperatorFunction<R4, R5, E>,
      op6: OperatorFunction<R5, R6, E>,
      op7: OperatorFunction<R6, R7, E>,
      op8: OperatorFunction<R7, R8, E>,
      op9: OperatorFunction<R8, R9, E>,
      op10: OperatorFunction<R9, R10, E>
    ) => ClassicObservable<R10, E>) &
    (<R>(operators: OperatorFunction<T, R, E>) => ClassicObservable<R, E>);
}

ClassicObservable.prototype.pipe = (function pipe(...operators) {
  return ClassicObservable.from(
    operators.reduce((acc, curr) => curr(acc), this[symbolObservable]())
  );
}: any);

module.exports = { Observable: ClassicObservable };
