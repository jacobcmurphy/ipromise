let MPromise =  //require('./mpromise');

new MPromise((resolve, reject) => {
  reject('start_reject_1 ');
  resolve('start_resolve_1 ');
  resolve('start_resolve_2 ');
  reject('start_reject_2 ');
}).catch((err) => {
  return new MPromise((resolve, reject) => resolve(err + 'catch_1 '));
}).then((data) => console.log(data + 'then_1 '));




new MPromise((resolve, reject) => {
  resolve('start_resolve_1 ');
  resolve('start_resolve_2 ');
  reject('start_reject_1 ');
  reject('start_reject_2 ');
}).then((data) => {
  return new MPromise((resolve, reject) => resolve(data + 'then_1 '));
}).catch((err) => {
  return new MPromise((resolve, reject) => resolve(err + 'catch_1 '));
}).then((data) => {
  console.log(data + 'then_2 ');
})
;
