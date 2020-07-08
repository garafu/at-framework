var fs = require("fs");
var promisecallback = require("../async/promisecallback.js");

var File = function () {

};

/**
 * Whethere the specified file is exists or not.
 * @param {string} path 
 * @param {functoin(err, isExists)} callback 
 */
File.isExists = function (path, callback) {
  promisecallback(new Promise((resolve, reject) => {
    fs.stat(path, (err, stats) => {
      if (!err && stats) {
        resolve(true);
      } else if (err && err.code === "ENOENT") {
        resolve(false);
      } else {
        reject(err);
      }
    });
  }), callback, this);
};

module.exports = File;