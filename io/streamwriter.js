var fs = require("fs");
var { EventEmitter } = require("events");
var util = require("util");
var i18n = require("iconv-lite");

/**
 * @class         Text string writer stream.
 * 
 * @public
 * @constructor   Create and initialize the StreamWriter class.
 * @param {string} filepath Filepath string for saving this stream.
 * @param {string} [encoding] File encode.
 */
var StreamWriter = function (filepath, encoding = "utf8") {
  this._filepath = filepath;
  this._encoding = encoding;
  this._stream = this._getWriteStream(filepath);
};
util.inherits(StreamWriter, EventEmitter);

/**
 * @event flushed
 */
/**
 * @event closed
 */

StreamWriter.prototype._getWriteStream = function (filepath) {
  var stream = fs.createWriteStream(filepath);
  stream.on("finish", () => {
    this.emit("closed");
  })
  stream.cork();
  return stream;
};

/**
 * Write specified string.
 * @public
 * @param {string}  text String to write.
 */
StreamWriter.prototype.write = function (text) {
  var stream = this._stream;
  var buffer = "" + text;

  stream.write(i18n.encode(buffer, this._encoding));
};

/**
 * Write specified string as a line.
 * @public
 * @param   {string}    text    String to write line.
 */
StreamWriter.prototype.writeLine = function (text) {
  var stream = this._stream;
  var buffer = "" + text + require("os").EOL;

  stream.write(i18n.encode(buffer, this._encoding));
};

/**
 * @public
 * @param   {function}  callback  Callback function which is called when stream is flushed.
 */
StreamWriter.prototype.flush = function (callback) {
  process.nextTick(() => {
    var stream = this._stream;
    stream.uncork();
    stream.cork();
    if (callback && typeof (callback) === "function") {
      callback();
    }
    this.emit("flushed");
  });
};

/**
 * @public
 * @param   {function}  callback  Callback function whici is called when stream is closed.
 */
StreamWriter.prototype.close = function (callback) {
  process.nextTick(() => {
    var stream = this._stream;
    stream.uncork();
    stream.end();
    if (callback && typeof (callback) === "function") {
      callback();
    }
  });
};

module.exports = StreamWriter;