// @flow
"use strict";
const { Observable } = require("../src/es-observable");
const { expect } = require("chai");
const { stub } = require("sinon");
const { concat } = require("../src/operators/concat");

describe("concat operator", function() {
  it("concats observables", function() {
    const observable = Observable.of(0, 1, 2);
    const next = stub();
    const error = stub();
    const complete = stub();

    concat(Observable.of(3, 4, 5))(observable).subscribe({
      next,
      error,
      complete
    });

    expect(next.args).to.deep.equal([[0], [1], [2], [3], [4], [5]]);
    expect(error.called).equal(false);
    expect(complete.calledOnce).equal(true);
  });
});
