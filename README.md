## IPromise

An attempted implementation of the Promise/A+ spec.
It also implements `IPromise.resolve`, `IPromise.reject`, and `IPromise.all` for convenience.

## Motivation

IPromise was written to give a single file implementation of a Promise so someone can more easily trace the code and see how a Promise works internally. This is meant as a learning aid and not as a production ready implementation of Promises.

## Credit
This borrows heavily from [promisejs.org](https://www.promisejs.org/implementing/) which in turn based off of a [StackOverflow post](https://stackoverflow.com/questions/23772801/basic-javascript-promise-implementation-attempt/23785244#23785244).

## License
Released under the [MIT License](https://github.com/jacobcmurphy/ipromise/blob/master/LICENSE)
