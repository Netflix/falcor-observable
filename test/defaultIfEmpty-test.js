// @flow
"use strict";
const { Observable } = require("../src/es-observable");
const { expect } = require("chai");
const { stub } = require("sinon");
const { defaultIfEmpty } = require("../src");

describe("defaultIfEmpty operator", function() {
  it("emits default if empty", function() {
    const observable = Observable.of();
    const observer = {
      next: stub(),
      error: stub(),
      complete: stub()
    };
    defaultIfEmpty(1)(observable).subscribe(observer);

    expect(observer.next.args).to.deep.equal([[1]]);
    expect(observer.error.called).equal(false);
    expect(observer.complete.calledOnce).equal(true);
  });

  it("does not emit default when non-empty", function() {
    const observable = Observable.of(0);
    const observer = {
      next: stub(),
      error: stub(),
      complete: stub()
    };
    defaultIfEmpty(1)(observable).subscribe(observer);

    expect(observer.next.args).to.deep.equal([[0]]);
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
    defaultIfEmpty(1)(observable).subscribe(observer);

    expect(observer.error.args).to.deep.equal([[err]]);
    expect(observer.next.called).equal(false);
    expect(observer.complete.called).equal(false);
  });
});
