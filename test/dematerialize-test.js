// @flow
"use strict";
const { Observable } = require("../src/es-observable");
const { expect } = require("chai");
const { stub } = require("sinon");
const { dematerialize } = require("../src");

describe("dematerialize operator", function() {
  it("dematerializes notifications", function() {
    const observable = Observable.of(
      { kind: "N", value: 0 },
      { kind: "N", value: 1 },
      { kind: "C" }
    );
    const observer = {
      next: stub(),
      error: stub(),
      complete: stub()
    };
    dematerialize()(observable).subscribe(observer);

    expect(observer.next.args).to.deep.equal([[0], [1]]);
    expect(observer.error.called).equal(false);
    expect(observer.complete.calledOnce).equal(true);
  });

  it("dematerializes errors", function() {
    const err = new Error("My error");
    const observable = Observable.of({ kind: "E", error: err });
    const observer = {
      next: stub(),
      error: stub(),
      complete: stub()
    };
    dematerialize()(observable).subscribe(observer);

    expect(observer.error.args).to.deep.equal([[err]]);
    expect(observer.next.called).to.equal(false);
    expect(observer.complete.calledOnce).equal(false);
  });
});
