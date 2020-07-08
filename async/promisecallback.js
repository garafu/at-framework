/**
 * Return Promise or callback function.
 * <pre>
 * var sample = async function (arg1, callback) {
 *    return promisecallback(new Promise((resolve, reject) => {
 *      // some process...
 *    }), callback, this);
 * }; 
 * </pre>
 * @param {Promise} promise 
 * @param {function} callback 
 * @param {object} thisarg 
 */
module.exports = function (promise, callback, thisarg) {
  if (callback) {
    promise.then((res) => {
      process.nextTick(() => { callback.call(thisarg, null, res); });
    }).catch((err) => {
      process.nextTick(() => { callback.call(thisarg, err); });
    });
  }
  return promise;
};