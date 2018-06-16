// @flow
"use strict";

import type { ISubscription, ISubscriptionObserver } from "./es-observable.js";

export interface ISubscriber<T, E = Error>
  extends ISubscription, ISubscriptionObserver<T, E> {}

export interface IOuterSubscriber<T, R, E = Error> extends ISubscriber<T, E> {
  notifyNext(
    outerValue: T,
    innerValue: R,
    outerIndex: number,
    innerIndex: number,
    innerSub: InnerSubscriber<T, R, E>
  ): void;
  notifyError(e: E, innerSub: InnerSubscriber<T, R, E>): void;
  notifyComplete(innerSub: InnerSubscriber<T, R, E>): void;
}

class InnerSubscriber<T, R, E = Error> implements ISubscriber<R, E> {
  parent: IOuterSubscriber<T, R, E>;
  outerValue: T;
  outerIndex: number;
  index: number;
  closed: boolean;
  subscription: ISubscription | null;
  constructor(
    parent: IOuterSubscriber<T, R, E>,
    outerValue: T,
    outerIndex: number
  ): void {
    this.parent = parent;
    this.outerValue = outerValue;
    this.outerIndex = outerIndex;
    this.index = 0;
    this.closed = false;
    this.subscription = null;
  }
  start(subscription: ISubscription): void {
    this.subscription = subscription;
  }
  next(value: R): void {
    this.parent.notifyNext(
      this.outerValue,
      value,
      this.outerIndex,
      this.index++,
      this
    );
  }
  error(err: E): void {
    this.parent.notifyError(err, this);
    this.closed = true;
  }
  complete(): void {
    this.parent.notifyComplete(this);
    this.closed = true;
  }
  unsubscribe(): void {
    if (this.closed) {
      return;
    }
    const { subscription } = this;
    if (subscription !== null) {
      subscription.unsubscribe();
    }
    this.closed = true;
  }
}

module.exports = { InnerSubscriber };
