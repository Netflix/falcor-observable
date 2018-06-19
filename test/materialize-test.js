// @flow
"use strict";
const { Observable } = require("../src/es-observable");
const { expect } = require("chai");
const { stub } = require("sinon");
const { materialize } = require("../src");

describe("materialize operator", function() {
  it("materializes values", function() {
    const observable = Observable.of(0, 1);
    const observer = {
      next: stub(),
      error: stub(),
      complete: stub()
    };
    materialize()(observable).subscribe(observer);

    expect(observer.next.args).to.deep.equal([
      [{ kind: "N", value: 0 }],
      [{ kind: "N", value: 1 }],
      [{ kind: "C" }]
    ]);
    expect(observer.error.called).equal(false);
    expect(observer.complete.calledOnce).equal(true);
  });

  it("materializes errors", function() {
    const err = new Error("My error");
    const observable = Observable.throw(err);
    const observer = {
      next: stub(),
      error: stub(),
      complete: stub()
    };
    materialize()(observable).subscribe(observer);

    expect(observer.next.args).to.deep.equal([[{ kind: "E", error: err }]]);
    expect(observer.error.called).equal(false);
    expect(observer.complete.calledOnce).equal(true);
  });
});
