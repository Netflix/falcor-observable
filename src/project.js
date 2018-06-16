// @flow
"use strict";

import type { ObservableInput } from "./es-observable";
const { Observable } = require("./es-observable");
const { tryCatchResult, symbolError, popError } = require("./try-catch");

function projectToObservable<T, R, E>(
  project: ?(value: T, i: number) => ObservableInput<R, E>,
  v: T,
  i: number
): Observable<R, E> {
  const result =
    typeof project === "function" ? tryCatchResult(project, v, i) : v;
  if (result === symbolError) {
    return Observable.throw((popError(): any));
  }
  const obs = tryCatchResult(Observable.from, result);
  if (obs === symbolError) {
    return Observable.throw((popError(): any));
  }
  return obs;
}

module.exports = { projectToObservable };
