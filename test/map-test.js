// @flow
"use strict";
const { Observable } = require("../src/es-observable");
const { expect } = require("chai");
const { spy, stub } = require("sinon");
const { map } = require("../src");

describe("map operator", function() {
  it("transforms values", function() {
    const observable = Observable.of(0, 1, 2);
    const observer = {
      next: stub(),
      error: stub(),
      complete: stub()
    };
    const project = spy((value, index) => value + index);
    map(project)(observable).subscribe(observer);

    expect(project.args).to.deep.equal([[0, 0], [1, 1], [2, 2]]);
    expect(observer.next.args).to.deep.equal([[0], [2], [4]]);
    expect(observer.error.called).equal(false);
    expect(observer.complete.calledOnce).equal(true);
  });
});
