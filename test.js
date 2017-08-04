let IPromise = require('./promise');

new IPromise((resolve, reject) => {
  reject('start_reject_1 ');
  resolve('start_resolve_1 ');
  resolve('start_resolve_2 ');
  reject('start_reject_2 ');
}).catch((err) => {
  return new IPromise((resolve, reject) => reject(err + 'catch_1 '));
}).then((data) => new IPromise((resolve, reject) => resolve(data + 'then_1 ')))
.catch((err) => new IPromise((resolve, reject) => resolve(err + 'catch_2 ')))
.then((data) => console.log(data + 'then_2 '));




new IPromise((resolve, reject) => {
  resolve('start_resolve_1 ');
  resolve('start_resolve_2 ');
  reject('start_reject_1 ');
  reject('start_reject_2 ');
}).then((data) => {
  return new IPromise((resolve, reject) => resolve(data + 'then_1 '));
}).catch((err) => {
  return new IPromise((resolve, reject) => resolve(err + 'catch_1 '));
}).then((data) => {
  console.log(data + 'then_2 ');
})
;
