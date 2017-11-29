// @flow
"use strict";

const symbolError = Symbol("try-catch-error");
let lastError: ?{ e: Error } = null;

function popError(): Error {
  if (!lastError) {
    throw new Error("popError may only be called once");
  }
  const { e } = lastError;
  lastError = null;
  return e;
}

let tryCatch: ((f: () => void) => void) &
  (<A>(f: (a: A) => void, a: A) => void) &
  (<A, B>(f: (a: A, b: B) => void, a: A, b: B) => void) &
  (<A, B, C>(f: (a: A, b: B, c: C) => void, a: A, b: B, c: C) => void);

let tryCatchResult: (<R>(f: () => R) => R | typeof symbolError) &
  (<A, R>(f: (a: A) => R, a: A) => R | typeof symbolError) &
  (<A, B, R>(f: (a: A, b: B) => R, a: A, b: B) => R | typeof symbolError) &
  (<A, B, C, R>(
    f: (a: A, b: B, c: C) => R,
    a: A,
    b: B,
    c: C
  ) => R | typeof symbolError);

if (process.env.FALCOR_OBSERVABLE_NO_CATCH) {
  tryCatch = (function dontTryCatch(f, ...args) {
    f.call(this, ...args);
  }: any);

  tryCatchResult = (function dontTryCatchResult(f, ...args) {
    return f.call(this, ...args);
  }: any);
} else {
  const throwError = (e: Error) => {
    throw e;
  };

  tryCatch = (function doTryCatch(f, ...args) {
    try {
      f.call(this, ...args);
    } catch (e) {
      // See https://github.com/ReactiveX/rxjs/issues/3004#issuecomment-339720668
      setImmediate(throwError, e);
    }
  }: any);

  tryCatchResult = (function doTryCatchResult(f, ...args) {
    try {
      return f.call(this, ...args);
    } catch (e) {
      lastError = { e };
      return symbolError;
    }
  }: any);
}

module.exports = { tryCatch, tryCatchResult, symbolError, popError };
