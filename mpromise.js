class MPromise {
  constructor(fn) {
    this.state = 'PENDING'; // PENDING, RESOLVED, REJECTED
    this.value = null;
    this.resolveCallbacks = [];
    this.rejectCallbacks = [];

    this._resolve = this._resolve.bind(this);
    this._reject = this._reject.bind(this);
    this._runPromise(fn, this._resolve, this._reject);
  }

  _runPromise(fn, resolveFn, rejectFn) {
    let done = false;
    try {
      fn((value) => {
        if (done) return;
        done = true;
        resolveFn(this.value);
      }, (reason) => {
        if (done) return;
        done = true;
        rejectFn(reason);
      })
    } catch (err) {
      if (done) return;
      done = true;
      rejectFn(err);
    }
  }

  _resolve(data) {
    if (data && typeof data.then === 'function') {
      _runPromise(data.then, this._resolve, this._reject);
      return;
    }
    if (this.resolveCallbacks) {

    }
    if (this.state !== 'PENDING') return;

    if (this.thenFn) {
      this.thenFn(data);
    } else {
      this.value = data;
    }
    this.state = 'RESOLVED';
  }

  _reject(err) {
    if (this.state !== 'PENDING') return;

    if (this.catchFn) {
      this.catchFn(err);
    } else {
      this.value = err;
    }
    this.state = 'REJECTED';
  }


  then(resolveFn, rejectFn) {
    return new MPromise((resolve, reject) => {
      try {
        resolve()
      } catch (e) {
        reject(e);
      }
    });
    if (this.state === 'RESOLVED') {
      fn(this.value);
    } else {
      this.thenFn = fn;
    }
    // return MPromise
  }

  catch(rejectFn) {
    if (this.state === 'REJECTED') {
      fn(this.value);
    } else {
      this.catchFn = fn;
    }
    // return MPromise
  }
};


// MPromise.all
// MPromise.resolve
// MPromise.reject


module.exports = MPromise;
