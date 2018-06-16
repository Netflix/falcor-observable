// @flow
"use strict";

import type {
  ObservableInput,
  OperatorFunction,
  ISubscription,
  ISubscriptionObserver
} from "../es-observable";
import type { IOuterSubscriber } from "../subscriber";
const { Observable } = require("../es-observable");
const { projectToObservable } = require("../project");
const { InnerSubscriber } = require("../subscriber");

class ExpandSubscriber<T, E> implements IOuterSubscriber<T, T, E> {
  destination: ISubscriptionObserver<T, E>;
  project: (value: T, i: number) => ObservableInput<T, E>;
  concurrent: number;
  innerSubs: Set<InnerSubscriber<T, T, E>>;
  buffer: T[];
  index: number;
  active: number;
  hasCompleted: boolean;
  closed: boolean;
  subscription: ISubscription | null;

  constructor(
    destination: ISubscriptionObserver<T, E>,
    project: (value: T, i: number) => ObservableInput<T, E>,
    concurrent: number
  ): void {
    this.destination = destination;
    this.project = project;
    this.concurrent = concurrent;
    this.innerSubs = new Set();
    this.buffer = [];
    this.index = 0;
    this.active = 0;
    this.hasCompleted = false;
    this.closed = false;
    this.subscription = null;
  }
  start(subscription: ISubscription): void {
    this.subscription = subscription;
  }
  next(value: T): void {
    if (this.active < this.concurrent) {
      this.projectTo(value);
    } else {
      this.buffer.push(value);
    }
  }
  error(e: E): void {
    this.destination.error(e);
    for (const s of this.innerSubs) {
      s.unsubscribe();
    }
    this.innerSubs.clear();
    this.closed = true;
  }
  complete(): void {
    this.hasCompleted = true;
    if (this.active === 0) {
      this.destination.complete();
      this.closed = true;
    }
  }
  projectTo(value: T): void {
    this.destination.next(value);
    const i = this.index++;
    const obs = projectToObservable(this.project, value, i);
    const innerSub = new InnerSubscriber(this, value, i);
    this.innerSubs.add(innerSub);
    this.active++;
    obs.subscribe(innerSub);
  }
  notifyNext(
    outerValue: T,
    innerValue: T,
    outerIndex: number,
    innerIndex: number,
    innerSub: InnerSubscriber<T, T, E>
  ): void {
    this.next(innerValue);
  }
  notifyError(e: E, innerSub: InnerSubscriber<T, T, E>): void {
    this.destination.error(e);
    this.innerSubs.delete(innerSub);
  }
  notifyComplete(innerSub: InnerSubscriber<T, T, E>): void {
    this.active--;
    this.innerSubs.delete(innerSub);
    if (this.buffer.length !== 0) {
      this.projectTo(this.buffer.shift());
    } else if (this.hasCompleted && this.active === 0) {
      this.destination.complete();
    }
  }
  unsubscribe(): void {
    if (this.closed) {
      return;
    }
    const { subscription } = this;
    if (subscription !== null) {
      subscription.unsubscribe();
    }
    for (const s of this.innerSubs) {
      s.unsubscribe();
    }
    this.innerSubs.clear();
    this.closed = true;
  }
}

function expand<T, E>(
  project: (value: T, i: number) => ObservableInput<T, E>,
  concurrent: number = Number.POSITIVE_INFINITY
): any {
  return function expandOperator(source) {
    return new Observable(observer => {
      const sub = new ExpandSubscriber(observer, project, concurrent);
      source.subscribe(sub);
      return sub;
    });
  };
}

module.exports = { expand };
