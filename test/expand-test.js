// @flow
"use strict";
const { Observable } = require("../src/es-observable");
const { expect } = require("chai");
const { spy, stub } = require("sinon");
const { expand } = require("../src");

describe("expand function", function() {
  it("recursively expands values", function() {
    const outerObservable = Observable.of(10, 11);
    const observer = {
      next: stub(),
      error: stub(),
      complete: stub()
    };
    const project = spy(
      (value, index) =>
        value < 100 ? Observable.of(value * 10 + index) : Observable.empty()
    );
    expand(project)(outerObservable).subscribe(observer);

    expect(project.args).to.deep.equal([[10, 0], [100, 1], [11, 2], [112, 3]]);
    expect(observer.next.args).to.deep.equal([[10], [100], [11], [112]]);
  });
});
