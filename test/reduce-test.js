// @flow
"use strict";
const { Observable } = require("../src/es-observable");
const { expect } = require("chai");
const { spy, stub } = require("sinon");
const { reduce } = require("../src");

describe("reduce function", function() {
  it("with seed", function() {
    const observable = Observable.of(0, 1, 2);
    const observer = {
      next: stub(),
      error: stub(),
      complete: stub()
    };
    const accumulator = spy((acc, value, index) => {
      return acc + value;
    });
    reduce(accumulator, 0)(observable).subscribe(observer);

    expect(accumulator.args).to.deep.equal([[0, 0, 0], [0, 1, 1], [1, 2, 2]]);
    expect(observer.next.args).to.deep.equal([[3]]);
    expect(observer.error.called).equal(false);
    expect(observer.complete.calledOnce).equal(true);
  });

  it("without seed", function() {
    const observable = Observable.of(0, 1, 2);
    const observer = {
      next: stub(),
      error: stub(),
      complete: stub()
    };
    const accumulator = spy((acc, value, index) => {
      return acc + value;
    });
    reduce(accumulator)(observable).subscribe(observer);

    expect(accumulator.args).to.deep.equal([[0, 1, 1], [1, 2, 2]]);
    expect(observer.next.args).to.deep.equal([[3]]);
    expect(observer.error.called).equal(false);
    expect(observer.complete.calledOnce).equal(true);
  });
});
