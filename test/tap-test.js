// @flow
"use strict";
const { Observable } = require("../src/es-observable");
const { expect } = require("chai");
const { spy, stub } = require("sinon");
const { tap } = require("../src");

describe("tap operator", function() {
  it("taps values", function() {
    const observable = Observable.of(0, 1, 2);
    const observer = {
      next: stub(),
      error: stub(),
      complete: stub()
    };
    const next = spy();
    const error = spy();
    const complete = spy();
    tap(next, error, complete)(observable).subscribe(observer);

    expect(next.args).to.deep.equal([[0], [1], [2]]);
    expect(error.notCalled);
    expect(observer.next.args).to.deep.equal([[0], [1], [2]]);
    expect(observer.error.called).equal(false);
    expect(observer.complete.calledOnce).equal(true);
  });
});
