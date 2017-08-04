function IPromise(fn) {
  let state = 'PENDING'; // store state which can be 'PENDING', 'FULFILLED' or 'REJECTED'
  let value = null;      // store value once 'FULFILLED' or 'REJECTED'
  let handlers = [];     // store sucess & failure handlers

  function reject(error) {
    state = 'REJECTED';
    value = error;
    handlers.forEach(handle);
    handlers = null;
  }

  function resolve(result) {
    try {
      let then = (result && typeof result.then === 'function') ? result.then : null;
      if (then) {
        doResolve(then.bind(result), resolve, reject);
        return;
      }
      state = 'FULFILLED';
      value = result;
      handlers.forEach(handle);
      handlers = null;
    } catch (e) {
      reject(e);
    }
  }

  function handle(handler) {
    if (state === 'PENDING') {
      handlers.push(handler);
    } else if (state === 'FULFILLED' && typeof handler.onFulfilled === 'function') {
      handler.onFulfilled(value);
    } else if (state === 'REJECTED' && typeof handler.onRejected === 'function') {
      handler.onRejected(value);
    }
  }

  this.then = function (onFulfilled, onRejected) {
    return new IPromise(function (resolve, reject) {
      let doneFullfillFn = function (result) {
        if (typeof onFulfilled === 'function') {
          try {
            return resolve(onFulfilled(result));
          } catch (ex) {
            return reject(ex);
          }
        } else {
          return resolve(result);
        }
      };

      let doneRejectedFn = function (error) {
        if (typeof onRejected === 'function') {
          try {
            return resolve(onRejected(error));
          } catch (ex) {
            return reject(ex);
          }
        } else {
          return reject(error);
        }
      };

      return process.nextTick(function () {
        handle({
          onFulfilled: doneFullfillFn,
          onRejected: doneRejectedFn
        });
      });
    });
  };


  this.catch = function(onRejected) {
    return this.then(null, onRejected);
  }

  function doResolve(fn, onFulfilled, onRejected) {
    let done = false;
    try {
      fn(function (value) {
        if (done) return;
        done = true;
        onFulfilled(value);
      }, function (reason) {
        if (done) return;
        done = true;
        onRejected(reason);
      });
    } catch (ex) {
      if (done) return;
      done = true;
      onRejected(ex);
    }
  }

  doResolve(fn, resolve, reject);
}


IPromise.resolve = (value) => {
  return new IPromise((resolve) => resolve(value));
};

IPromise.reject = (value) => {
  return new IPromise((_resolve, reject) => reject(value));
};

module.exports = IPromise;
