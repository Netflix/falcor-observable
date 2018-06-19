// @flow
"use strict";
const { Observable } = require("../src/es-observable");
const { expect } = require("chai");
const { spy, stub } = require("sinon");
const { catchError } = require("../src");

describe("catchError operator", function() {
  it("catches errors", function() {
    const err = new Error("My error");
    const observable = new Observable(observer => {
      observer.next(0);
      observer.error(err);
    });
    const observer = {
      next: stub(),
      error: stub(),
      complete: stub()
    };

    const catcher = spy(e => Observable.of(1));
    catchError(catcher)(observable).subscribe(observer);

    expect(catcher.args).to.deep.equal([[err, observable]]);
    expect(observer.next.args).to.deep.equal([[0], [1]]);
    expect(observer.error.called).equal(false);
    expect(observer.complete.calledOnce).equal(true);
  });
});
