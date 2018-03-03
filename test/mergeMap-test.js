// @flow
"use strict";
const { Observable } = require("../src/es-observable");
const { expect } = require("chai");
const { spy, stub } = require("sinon");
const { concatAll, concatMap, mergeAll, mergeMap } = require("../src");

describe("mergeMap operator functions", function() {
  it("concatMap subscribes one at a time", function() {
    const innerObservers = [];
    const innerObservables = [];
    innerObservables.push(
      new Observable(observer => {
        innerObservers.push(observer);
      })
    );
    innerObservables.push(
      new Observable(observer => {
        innerObservers.push(observer);
      })
    );
    let outerObserver;
    const outerObservable = new Observable(observer => {
      outerObserver = observer;
    });
    const observer = {
      next: stub(),
      error: stub(),
      complete: stub()
    };
    const project = spy((value, index) => innerObservables[index]);
    concatMap(project)(outerObservable).subscribe(observer);
    if (!outerObserver) {
      throw new Error("outerObservable not subscribed");
    }
    outerObserver.next(10);
    outerObserver.next(11);
    expect(project.args).to.deep.equal([[10, 0]]);

    innerObservers[0].next(100);
    innerObservers[0].next(101);
    expect(observer.next.args).to.deep.equal([[100], [101]]);

    expect(innerObservers.length).to.equal(1);
    innerObservers[0].complete();
    expect(project.args).to.deep.equal([[10, 0], [11, 1]]);
    expect(innerObservers.length).to.equal(2);

    innerObservers[1].next(110);
    innerObservers[1].next(111);
    innerObservers[1].complete();
    expect(observer.complete.calledOnce).equal(false);
    expect(observer.next.args).to.deep.equal([[100], [101], [110], [111]]);

    outerObserver.complete();
    expect(observer.error.called).equal(false);
    expect(observer.complete.calledOnce).equal(true);
  });

  it("concatAll subscribes one at a time", function() {
    const innerObservers = [];
    const innerObservables = [];
    innerObservables.push(
      new Observable(observer => {
        innerObservers.push(observer);
      })
    );
    innerObservables.push(
      new Observable(observer => {
        innerObservers.push(observer);
      })
    );
    const outerObservable = Observable.from(innerObservables);
    const observer = {
      next: stub(),
      error: stub(),
      complete: stub()
    };
    concatAll()(outerObservable).subscribe(observer);

    innerObservers[0].next(100);
    innerObservers[0].next(101);
    expect(observer.next.args).to.deep.equal([[100], [101]]);

    expect(innerObservers.length).to.equal(1);
    innerObservers[0].complete();
    expect(innerObservers.length).to.equal(2);

    innerObservers[1].next(110);
    innerObservers[1].next(111);
    innerObservers[1].complete();
    expect(observer.next.args).to.deep.equal([[100], [101], [110], [111]]);
    expect(observer.error.called).equal(false);
    expect(observer.complete.calledOnce).equal(true);
  });

  it("mergeMap subscribes all at once", function() {
    const innerObservers = [];
    const innerObservables = [];
    innerObservables.push(
      new Observable(observer => {
        innerObservers.push(observer);
      })
    );
    innerObservables.push(
      new Observable(observer => {
        innerObservers.push(observer);
      })
    );
    let outerObserver;
    const outerObservable = new Observable(observer => {
      outerObserver = observer;
    });
    const observer = {
      next: stub(),
      error: stub(),
      complete: stub()
    };
    const project = spy((value, index) => innerObservables[index]);
    mergeMap(project)(outerObservable).subscribe(observer);
    if (!outerObserver) {
      throw new Error("outerObservable not subscribed");
    }
    outerObserver.next(10);
    outerObserver.next(11);
    expect(project.args).to.deep.equal([[10, 0], [11, 1]]);
    expect(innerObservers.length).to.equal(2);

    innerObservers[1].next(110);
    innerObservers[1].next(111);
    innerObservers[1].complete();
    innerObservers[0].next(100);
    innerObservers[0].next(101);
    innerObservers[0].complete();
    expect(observer.next.args).to.deep.equal([[110], [111], [100], [101]]);

    expect(observer.complete.calledOnce).equal(false);
    outerObserver.complete();
    expect(observer.error.called).equal(false);
    expect(observer.complete.calledOnce).equal(true);
  });

  it("mergeAll subscribes all at once", function() {
    const innerObservers = [];
    const innerObservables = [];
    innerObservables.push(
      new Observable(observer => {
        innerObservers.push(observer);
      })
    );
    innerObservables.push(
      new Observable(observer => {
        innerObservers.push(observer);
      })
    );
    const outerObservable = Observable.from(innerObservables);
    const observer = {
      next: stub(),
      error: stub(),
      complete: stub()
    };
    mergeAll()(outerObservable).subscribe(observer);
    expect(innerObservers.length).to.equal(2);

    innerObservers[1].next(110);
    innerObservers[1].next(111);
    innerObservers[1].complete();
    innerObservers[0].next(100);
    innerObservers[0].next(101);
    innerObservers[0].complete();
    expect(observer.next.args).to.deep.equal([[110], [111], [100], [101]]);
    expect(observer.error.called).equal(false);
    expect(observer.complete.calledOnce).equal(true);
  });
});
