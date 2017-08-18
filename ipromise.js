class IPromise {
  constructor (fn) {
    this.state = 'PENDING'; // store state which can be 'PENDING', 'FULFILLED' or 'REJECTED'
    this.value = null;      // store value once 'FULFILLED' or 'REJECTED'
    this.handlers = [];     // store sucess & failure handlers

    this.then = this.then.bind(this);
    this.catch = this.catch.bind(this);
    this.resolve = this.resolve.bind(this);
    this.reject = this.reject.bind(this);
    this.handle = this.handle.bind(this);
    this.doResolve = this.doResolve.bind(this);

    this.doResolve(fn, this.resolve, this.reject);
  }

  static all (promises) {
    const results = [];

    return new IPromise((resolve, reject) => {
      if (promises.length === 0) return resolve([]);

      promises.forEach((promise) => {
        promise.then((result) => {
          results.push(result);
          if (results.length === promises.length) return resolve(results);
        }).catch((err) => reject(err));
      });
    });
  }

  static resolve (value) {
    return new IPromise((resolve) => resolve(value));
  }

  static reject (value) {
    return new IPromise((_resolve, reject) => reject(value));
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
        this.doResolve(then.bind(result), this.resolve, this.reject);
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
    return new IPromise((resolve, reject) => {
      let doneFullfillFn = (result) => {
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

      let doneRejectedFn = (error) => {
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

      return process.nextTick(() => {
        this.handle({
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
      fn((value) => {
        if (done) return;
        done = true;
        onFulfilled(value);
      }, (reason) => {
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

module.exports = IPromise;
