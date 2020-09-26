/**
 * Sleep specified milliseconds.
 * @param {number} time 
 */
module.exports = (time) => {
  return new Promise((resolve, reject) => {
    global.setTimeout(resolve, time);
  });
}