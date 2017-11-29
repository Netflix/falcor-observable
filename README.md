# falcor-observable

An Observable implementation compatible with the Falcor DataSource API.

Unless you are implementing a Falcor DataSource you will likely be better
served by the more fully featured [RxJS].

## Error handling policy

The error handling policy of the Observable is configurable to allow for
easier core dump debugging.

By default, errors thrown by the subscriber function are caught as they are in
the Promise API. Errors calling the observer's notification callbacks are
swallowed by default.

To disable all try/catch usage in falcor-observable, call set the environment
variable `FALCOR_OBSERVABLE_NO_CATCH` to a non empty value before this package
is first imported.

## Interoperability with other Observable implementations

This package is interoperable with [RxJS] and other Observable implementations
following the [symbol-observable] protocol. Use `Observable.from(other)` to
convert between implementations:

```js
const Rx = require("rxjs/Rx");
const falcorObservable = require("falcor-observable").Observable;

// Take any compliant observable.
const obs = Rx.Observable.of(1, 2, 3);

// Convert to falcor-observable.
const fobs = falcorObservable.from(obs);
fobs.subscribe({
  onNext(value) {
    console.log("onNext", value);
  }
});

// Convert to RxJS.
const rxobs = Rx.Observable.from(fobs);
rxobs.subscribe({
  next(value) {
    console.log("next", value);
  }
});
```

## Applying operators to an Observable

The `pipe` instance method can be used to apply operators to an Observable.

```js
const { Observable, operators: { map } } = require("falcor-observable");

Observable.of(1,2,3)
  .pipe(
    map(x => x + 1),
    map(x => x + 1))
  .subscribe({
    onNext(value) {
      console.log("onNext", value);
    }
  });
```

[RxJS]: https://www.npmjs.com/package/rxjs
[symbol-observable]: https://www.npmjs.com/package/symbol-observable
