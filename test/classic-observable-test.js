// @flow
"use strict";
const { Observable } = require("../src/classic-observable");
const { expect } = require("chai");
const { stub } = require("sinon");
const map = require("../src/map");

describe("Observable subscribe", function() {
  it("functions", function(done) {
    const onNext = stub();
    Observable.of(1, 2, 3).subscribe(onNext, done, () => {
      expect(onNext.args).to.deep.equal([[1], [2], [3]]);
      done();
    });
  });

  it("only onNext function", function() {
    const onNext = stub();
    Observable.of(1, 2, 3).subscribe(onNext);
    expect(onNext.args).to.deep.equal([[1], [2], [3]]);
  });

  it("only onNext partial observer", function() {
    const onNext = stub();
    Observable.of(1, 2, 3).subscribe({ onNext });
    expect(onNext.args).to.deep.equal([[1], [2], [3]]);
  });

  it("only onError partial observer", function() {
    const onError = stub();
    const err = new Error("Err");
    Observable.throw(err).subscribe({ onError });
    expect(onError.args).to.deep.equal([[err]]);
  });

  it("only onError function", function() {
    const onError = stub();
    const err = new Error("Err");
    Observable.throw(err).subscribe(null, onError);
    expect(onError.args).to.deep.equal([[err]]);
  });

  it("only onCompleted partial observer", function(done) {
    Observable.of(1, 2, 3).subscribe({ onCompleted: done });
  });

  it("only onCompleted function", function(done) {
    Observable.of(1, 2, 3).subscribe(null, null, done);
  });

  it("no arguments", function() {
    Observable.of(1, 2, 3).subscribe();
  });

  it("empty partial observer", function() {
    Observable.of(1, 2, 3).subscribe({});
  });

  it("pipes", function() {
    const onNext = stub();
    const onError = stub();
    const onCompleted = stub();

    Observable.pipe(
      Observable.of(0, 1, 2),
      map(x => x + 1),
      map(x => x + 1)
    ).subscribe({ onNext, onError, onCompleted });

    expect(onNext.args).to.deep.equal([[2], [3], [4]]);
    expect(onError.called).equal(false);
    expect(onCompleted.calledOnce).equal(true);
  });
});
