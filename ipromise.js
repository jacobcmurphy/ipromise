// Thanks to https://www.promisejs.org/implementing/ from which I eagerly copied and modified.

class IPromise {
  constructor (fn) {
    this.state = 'PENDING'; // store state which can be 'PENDING', 'FULFILLED' or 'REJECTED'
    this.value = null;      // store value once 'FULFILLED' or 'REJECTED'
    this.handlers = [];     // store sucess & failure handlers

    this.reject = this.reject.bind(this);
    this.resolve = this.resolve.bind(this);
    this.handle = this.handle.bind(this);
    this.then = this.then.bind(this);
    this.catch = this.catch.bind(this);
    this.doResolve = this.doResolve.bind(this);

    this.doResolve(fn, this.resolve, this.reject);
  }

  reject (error) {
    this.state = 'REJECTED';
    this.value = error;
    this.handlers.forEach(this.handle);
    this.handlers = null;
  }

  resolve (result) {
    try {
      let then = (result && typeof result.then === 'function') ? result.then : null;
      if (then) {
        this.doResolve(then.bind(result), resolve, reject);
        return;
      }
      this.state = 'FULFILLED';
      this.value = result;
      this.handlers.forEach(this.handle);
      this.handlers = null;
    } catch (e) {
      this.reject(e);
    }
  }

  handle (handler) {
    if (this.state === 'PENDING') {
      this.handlers.push(handler);
    } else if (this.state === 'FULFILLED' && typeof handler.onFulfilled === 'function') {
      handler.onFulfilled(this.value);
    } else if (this.state === 'REJECTED' && typeof handler.onRejected === 'function') {
      handler.onRejected(this.value);
    }
  }

  then (onFulfilled, onRejected) {
    let self = this;
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
        self.handle({
          onFulfilled: doneFullfillFn,
          onRejected: doneRejectedFn
        });
      });
    });
  }


  catch (onRejected) {
    return this.then(null, onRejected);
  }

  doResolve (fn, onFulfilled, onRejected) {
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
}

IPromise.prototype.resolve = (value) => {
  return new IPromise((resolve) => resolve(value));
};

IPromise.prototype.reject = (err) => {
  return new IPromise((_resolve, reject) => reject(err));
};


module.exports = IPromise;
