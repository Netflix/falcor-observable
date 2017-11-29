// @flow
"use strict";
const { Observable } = require("../src/es-observable");
const { expect } = require("chai");
const { stub } = require("sinon");

describe("ES Observable subscribe", function() {
  it("functions", function(done) {
    const next = stub();
    Observable.of(1, 2, 3).subscribe(next, done, () => {
      expect(next.args).to.deep.equal([[1], [2], [3]]);
      done();
    });
  });

  it("only next function", function() {
    const next = stub();
    Observable.of(1, 2, 3).subscribe(next);
    expect(next.args).to.deep.equal([[1], [2], [3]]);
  });

  it("only next partial observer", function() {
    const next = stub();
    Observable.of(1, 2, 3).subscribe({ next });
    expect(next.args).to.deep.equal([[1], [2], [3]]);
  });

  it("only error partial observer", function() {
    const error = stub();
    const err = new Error("Err");
    Observable.throw(err).subscribe({ error });
    expect(error.args).to.deep.equal([[err]]);
  });

  it("only error function", function() {
    const error = stub();
    const err = new Error("Err");
    Observable.throw(err).subscribe(null, error);
    expect(error.args).to.deep.equal([[err]]);
  });

  it("only complete partial observer", function(done) {
    Observable.of(1, 2, 3).subscribe({ complete: done });
  });

  it("only complete function", function(done) {
    Observable.of(1, 2, 3).subscribe(null, null, done);
  });

  it("no arguments", function() {
    Observable.of(1, 2, 3).subscribe();
  });

  it("empty partial observer", function() {
    Observable.of(1, 2, 3).subscribe({});
  });
});

describe("ES Observable fromClassicObservable", function() {
  it("adapts from classic observable", function() {
    const disposable = {
      isDisposed: false,
      dispose() {
        this.isDisposed = true;
      }
    };
    let observer;
    const classic = {
      subscribe(obs, onError, onCompleted) {
        observer = obs;
        return disposable;
      }
    };
    const obs = Observable.fromClassicObservable(classic);
    const next = stub();
    const error = stub();
    const complete = stub();
    const subscription = obs.subscribe({ next, error, complete });
    (observer: any).onNext(1);
    expect(next.args).to.deep.equal([[1]]);
    subscription.unsubscribe();
    expect(disposable.isDisposed).to.equal(true);
  });
});
