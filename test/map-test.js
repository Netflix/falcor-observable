// @flow
"use strict";
const { Observable } = require("../src/es-observable");
const { expect } = require("chai");
const { stub } = require("sinon");
const map = require("../src/map");

describe("map function", function() {
  it("functions", function() {
    const observable = Observable.of(0,1,2);
    const next = stub();
    const error = stub();
    const complete = stub();

    map((value, index, thisArg) =>  {
      expect(thisArg).equal(observable);
      expect(value).equal(index);
      return value + 1;
    })(observable).subscribe({ next, error, complete});

    expect(next.args).to.deep.equal([[1], [2], [3]]);
    expect(error.called).equal(false);
    expect(complete.calledOnce).equal(true);
  });
});
