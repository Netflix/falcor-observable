// @flow
"use strict";
import type { OperatorFunction } from "../es-observable";
const { reduce } = require("./reduce");

function toArrayReducer<T>(arr: T[], item: T, index: number): T[] {
  arr.push(item);
  return arr;
}

function toArray<T, E>(): OperatorFunction<T, T[], E> {
  return reduce(toArrayReducer, []);
}

module.exports = { toArray };
