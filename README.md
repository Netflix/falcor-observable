# falcor-observable

An Observable implementation compatible with the Falcor DataSource API.

## Error handling policy

The error handling policy of the Observable is configurable to allow for
easier core dump debugging.

By default, errors thrown by the subscriber function are caught as they are in
the Promise API. Errors calling the observer's notification callbacks are
swallowed by default.

To disable all try/catch usage in the Observable, call
`shouldCatchErrors(false)`.

To install an error reporter (a function taking a single error argument), call
`setReportError(console.error)`.
