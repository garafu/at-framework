var fs = require("fs");
var promisecallback = require("../async/promisecallback");

var Directory = function () {

};

/**
 * Create specified all directory and sub-directory.
 * @param {string} path 
 * @param {function(err)} callback 
 * @returns {Promise}
 */
Directory.create = function (path, callback) {
  return promisecallback(new Promise((resolve, reject) => {
    fs.mkdir(path, { recursive: true }, (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  }), callback, this);
};

module.exports = Directory;