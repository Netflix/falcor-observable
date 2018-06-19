// @flow
"use strict";
const { Observable } = require("../src/es-observable");
const { expect } = require("chai");
const { stub } = require("sinon");
const { toArray } = require("../src");

describe("toArray operator", function() {
  it("collects values", function() {
    const observable = Observable.of(0, 1, 2);
    const observer = {
      next: stub(),
      error: stub(),
      complete: stub()
    };
    toArray()(observable).subscribe(observer);

    expect(observer.next.args).to.deep.equal([[[0, 1, 2]]]);
    expect(observer.error.called).equal(false);
    expect(observer.complete.calledOnce).equal(true);
  });

  it("preserves errors", function() {
    const err = new Error("My error");
    const observable = Observable.throw(err);
    const observer = {
      next: stub(),
      error: stub(),
      complete: stub()
    };
    toArray()(observable).subscribe(observer);

    expect(observer.error.args).to.deep.equal([[err]]);
    expect(observer.next.called).equal(false);
    expect(observer.complete.called).equal(false);
  });
});
