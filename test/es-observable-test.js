// @flow
"use strict";
const { Observable } = require("../src/es-observable");
const { map } = require("../src/operators/map");
const { expect } = require("chai");
const { stub } = require("sinon");

describe("ES Observable", function() {
  describe("subscribe", function() {
    it("functions", function(done) {
      const next = stub();
      Observable.of(1, 2, 3).subscribe(next, done, () => {
        expect(next.args).to.deep.equal([[1], [2], [3]]);
        done();
      });
    });

    it("only next function", function() {
      const next = stub();
      Observable.of(1, 2, 3).subscribe(next);
      expect(next.args).to.deep.equal([[1], [2], [3]]);
    });

    it("only next partial observer", function() {
      const next = stub();
      Observable.of(1, 2, 3).subscribe({ next });
      expect(next.args).to.deep.equal([[1], [2], [3]]);
    });

    it("only error partial observer", function() {
      const error = stub();
      const err = new Error("Err");
      Observable.throw(err).subscribe({ error });
      expect(error.args).to.deep.equal([[err]]);
    });

    it("only error function", function() {
      const error = stub();
      const err = new Error("Err");
      Observable.throw(err).subscribe(null, error);
      expect(error.args).to.deep.equal([[err]]);
    });

    it("only complete partial observer", function(done) {
      Observable.of(1, 2, 3).subscribe({ complete: done });
    });

    it("only complete function", function(done) {
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
      const classic = {
        subscribe(obs, onError, onCompleted) {
          observer = obs;
          return disposable;
        }
      };
      const obs = Observable.from(classic);
      const next = stub();
      const error = stub();
      const complete = stub();
      const subscription = obs.subscribe({ next, error, complete });
      (observer: any).onNext(1);
      expect(next.args).to.deep.equal([[1]]);
      subscription.unsubscribe();
      expect(disposable.isDisposed).to.equal(true);
    });

    it("adapts from Promise (resolve)", function(done) {
      const obs = Observable.from(new Promise((resolve, reject) => resolve(1)));
      const next = stub();
      obs.subscribe({
        next,
        error(e) {
          done(e);
        },
        complete() {
          expect(next.args).to.deep.equal([[1]]);
          done();
        }
      });
    });

    it("adapts from Promise (reject)", function(done) {
      const err = new Error("my error");
      const obs = Observable.from(
        new Promise((resolve, reject) => reject(err))
      );
      const next = stub();
      obs.subscribe({
        next,
        error(e) {
          expect(e).to.equal(err);
          expect(next.called).to.equal(false);
          done();
        },
        complete() {
          throw new Error("should not reach here");
        }
      });
    });
  });

  describe("pipe", function() {
    it("pipes", function() {
      const next = stub();
      const error = stub();
      const complete = stub();

      Observable.of(0, 1, 2)
        .pipe(map(x => x + 1), map(x => x + 1))
        .subscribe({ next, error, complete });

      expect(next.args).to.deep.equal([[2], [3], [4]]);
      expect(error.called).equal(false);
      expect(complete.calledOnce).equal(true);
    });
  });

  describe("defer", function() {
    it("defers", function() {
      const next = stub();
      const error = stub();
      const complete = stub();

      Observable.defer(() => Observable.of(0, 1, 2)).subscribe({
        next,
        error,
        complete
      });

      expect(next.args).to.deep.equal([[0], [1], [2]]);
      expect(error.called).equal(false);
      expect(complete.calledOnce).equal(true);
    });
  });
});
