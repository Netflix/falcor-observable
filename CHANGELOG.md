# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="1.3.0"></a>
# [1.3.0](https://github.com/Netflix/falcor-observable/compare/v1.2.1...v1.3.0) (2018-06-25)


### Bug Fixes

* concat operator should accept observable inputs. ([7886c8a](https://github.com/Netflix/falcor-observable/commit/7886c8a))


### Features

* adapt from Promise and classic observables in from ([eb5c390](https://github.com/Netflix/falcor-observable/commit/eb5c390))



<a name="1.2.1"></a>
## [1.2.1](https://github.com/Netflix/falcor-observable/compare/v1.2.0...v1.2.1) (2018-06-21)



<a name="1.2.0"></a>
# [1.2.0](https://github.com/Netflix/falcor-observable/compare/v1.1.2...v1.2.0) (2018-06-19)


### Bug Fixes

* Observable.pipe flow type annotation. ([3c0fdf8](https://github.com/Netflix/falcor-observable/commit/3c0fdf8))


### Features

* catchError, defaultIfempty, dematerialize, materialize, filter, toArray. ([443f9d8](https://github.com/Netflix/falcor-observable/commit/443f9d8))
* concat operator ([afb1a70](https://github.com/Netflix/falcor-observable/commit/afb1a70))
* expand operator ([d9613e2](https://github.com/Netflix/falcor-observable/commit/d9613e2))
* Observable.defer ([1a702d7](https://github.com/Netflix/falcor-observable/commit/1a702d7))
* tap operator ([2bcc6aa](https://github.com/Netflix/falcor-observable/commit/2bcc6aa))



<a name="1.1.2"></a>
## [1.1.2](https://github.com/Netflix/falcor-observable/compare/v1.1.1...v1.1.2) (2018-03-30)


### Bug Fixes

* Silence Flow error with updated Flow version. ([39fcf56](https://github.com/Netflix/falcor-observable/commit/39fcf56))



<a name="1.1.1"></a>
## [1.1.1](https://github.com/Netflix/falcor-observable/compare/v1.1.0...v1.1.1) (2018-03-07)



<a name="1.1.0"></a>
# [1.1.0](https://github.com/Netflix/falcor-observable/compare/v1.0.1...v1.1.0) (2018-03-03)


### Bug Fixes

* Flow annotation for map operator. ([e52e67e](https://github.com/Netflix/falcor-observable/commit/e52e67e))


### Features

* mergeMap, mergeAll, concatMap, concatAll ([03e3c2a](https://github.com/Netflix/falcor-observable/commit/03e3c2a))
* reduce operator. ([c249c48](https://github.com/Netflix/falcor-observable/commit/c249c48))



<a name="1.0.1"></a>
## [1.0.1](https://github.com/Netflix/falcor-observable/compare/v1.0.0...v1.0.1) (2017-12-07)


### Bug Fixes

* named export typo. ([12e5caf](https://github.com/Netflix/falcor-observable/commit/12e5caf))



<a name="1.0.0"></a>
# [1.0.0](https://github.com/Netflix/falcor-observable/compare/v0.4.0...v1.0.0) (2017-12-07)


### Features

* export pipeable operators directly from root module. ([5a931c0](https://github.com/Netflix/falcor-observable/commit/5a931c0))


### BREAKING CHANGES

* pipeable operators are no longer nested under 'operators'.



<a name="0.4.0"></a>
# [0.4.0](https://github.com/Netflix/falcor-observable/compare/v0.3.1...v0.4.0) (2017-11-29)


### Features

* Observable.fromClassicObservable ([34d06f3](https://github.com/Netflix/falcor-observable/commit/34d06f3))
* pipe method and map operator ([31f9b0f](https://github.com/Netflix/falcor-observable/commit/31f9b0f))



<a name="0.3.1"></a>
## [0.3.1](https://github.com/Netflix/falcor-observable/compare/v0.3.0...v0.3.1) (2017-11-09)



<a name="0.3.0"></a>
# [0.3.0](https://github.com/Netflix/falcor-observable/compare/v0.2.0...v0.3.0) (2017-11-07)


### Features

* Report errors asynchronously to avoid need for configuration. ([3366fce](https://github.com/Netflix/falcor-observable/commit/3366fce))
* use FALCOR_OBSERVABLE_NO_CATCH env var to disable try/catch. ([34ef747](https://github.com/Netflix/falcor-observable/commit/34ef747))



<a name="0.2.0"></a>
# [0.2.0](https://github.com/Netflix/falcor-observable/compare/v0.1.0...v0.2.0) (2017-09-21)


### Features

* Reimplement using es-observable spec as base then adapt to class observable. ([606a63c](https://github.com/Netflix/falcor-observable/commit/606a63c))
* report thrown errors to window.error or console.warn ([e658c44](https://github.com/Netflix/falcor-observable/commit/e658c44))



<a name="0.1.0"></a>
# 0.1.0 (2017-09-15)
