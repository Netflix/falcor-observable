// @flow
"use strict";
const { Observable } = require("../src/classic-observable");
const Rx = require("rxjs/Rx");
const { expect } = require("chai");
const { stub } = require("sinon");

describe("Rx Observable interoperability", function() {
  it("converts from Falcor Observable to Rx Observable", function() {
    const next = stub();
    const fobs = Observable.of(1, 2, 3);
    const rxobs = Rx.Observable.from(fobs);
    expect(rxobs).instanceof(Rx.Observable);
    rxobs.subscribe({ next });
    expect(next.args).to.deep.equal([[1], [2], [3]]);
  });

  it("converts from Rx Observable to Falcor Observable", function() {
    const onNext = stub();
    const rxobs = Rx.Observable.of(1, 2, 3);
    const fobs = Observable.from(rxobs);
    expect(fobs).instanceof(Observable);
    fobs.subscribe({ onNext });
    expect(onNext.args).to.deep.equal([[1], [2], [3]]);
  });

  it("converts to and from Rx Observable", function() {
    const next = stub();
    const obs = Rx.Observable.of(1, 2, 3);
    const fobs = Observable.from(obs);
    const rxobs = Rx.Observable.from(fobs);
    expect(rxobs).instanceof(Rx.Observable);
    rxobs.subscribe({ next });
    expect(next.args).to.deep.equal([[1], [2], [3]]);
  });
});
