function Promise(fn) {
  var state = 'PENDING'; // store state which can be 'PENDING', 'FULFILLED' or 'REJECTED'
  var value = null;      // store value once 'FULFILLED' or 'REJECTED'
  var handlers = [];     // store sucess & failure handlers

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
    var self = this;
    return new Promise(function (resolve, reject) {
      var doneFullfillFn = function (result) {
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

      var doneRejectedFn = function (error) {
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


  // this.catch = function(onRejected) {
  //   var self = this;
  //   return new Promise(function (resolve, reject) {
  //     return self.done(null, function (error) {
  //       if (typeof onRejected === 'function') {
  //         try {
  //           return resolve(onRejected(error));
  //         } catch (ex) {
  //           return reject(ex);
  //         }
  //       } else {
  //         return reject(error);
  //       }
  //     });
  //   });
  // }

  function doResolve(fn, onFulfilled, onRejected) {
    var done = false;
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


let p = new Promise((resolve, reject) => {
  console.log("HIT 1");
  resolve("a");
  reject("y");
});


// p.catch((err) => {
//   console.log("HIT 3");
//   console.log("err: " + err);
// });

p.then((data) => {
  console.log("HIT 2");
  console.log("data: " + data);
  return new Promise((resolve, reject) => resolve('next'));
}, (err) => {
  console.log("err: " + err);
}).then(d => console.log(d));
