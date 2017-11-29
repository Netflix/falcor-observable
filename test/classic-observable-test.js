// @flow
"use strict";
const { Observable } = require("../src/classic-observable");
const { expect } = require("chai");
const { stub } = require("sinon");
import type { IClassicObservable } from "../src/classic-observable";

describe("Classic Observable", function() {
  describe("subscribe", function() {
    it("functions", function(done) {
      const onNext = stub();
      Observable.of(1, 2, 3).subscribe(onNext, done, () => {
        expect(onNext.args).to.deep.equal([[1], [2], [3]]);
        done();
      });
    });

    it("only onNext function", function() {
      const onNext = stub();
      Observable.of(1, 2, 3).subscribe(onNext);
      expect(onNext.args).to.deep.equal([[1], [2], [3]]);
    });

    it("only onNext partial observer", function() {
      const onNext = stub();
      Observable.of(1, 2, 3).subscribe({ onNext });
      expect(onNext.args).to.deep.equal([[1], [2], [3]]);
    });

    it("only onError partial observer", function() {
      const onError = stub();
      const err = new Error("Err");
      Observable.throw(err).subscribe({ onError });
      expect(onError.args).to.deep.equal([[err]]);
    });

    it("only onError function", function() {
      const onError = stub();
      const err = new Error("Err");
      Observable.throw(err).subscribe(null, onError);
      expect(onError.args).to.deep.equal([[err]]);
    });

    it("only onCompleted partial observer", function(done) {
      Observable.of(1, 2, 3).subscribe({ onCompleted: done });
    });

    it("only onCompleted function", function(done) {
      Observable.of(1, 2, 3).subscribe(null, null, done);
    });

    it("no arguments", function() {
      Observable.of(1, 2, 3).subscribe();
    });

    it("empty partial observer", function() {
      Observable.of(1, 2, 3).subscribe({});
    });
  });

  describe("from", function() {
    it("adapts from classic observable", function() {
      const disposable = {
        isDisposed: false,
        dispose() {
          this.isDisposed = true;
        }
      };
      let observer;
      const classicObservable: IClassicObservable<number> = {
        subscribe(obs, onError, onCompleted) {
          observer = obs;
          return disposable;
        }
      };
      const obs = Observable.from(classicObservable);
      const onNext = stub();
      const onError = stub();
      const onCompleted = stub();
      const subscription = obs.subscribe({ onNext, onError, onCompleted });
      (observer: any).onNext(1);
      expect(onNext.args).to.deep.equal([[1]]);
      subscription.dispose();
      expect(disposable.isDisposed).to.equal(true);
    });
  });
});
