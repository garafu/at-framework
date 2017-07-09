var fs = require("fs");
var { EventEmitter } = require("events");
var util = require("util");

/**
 * @class         Text string reader stream.
 * 
 * @public
 * @constructor   Create and initialize StreamReader class.
 * @param {string} filepath 
 * @param {string} [encoding] 
 */
var StreamReader = function (filepath, encoding = "utf8") {
  this._filepath = filepath;
  this._encoding = encoding;
  this._stream = this._getReadStream(filepath, encoding);
  this._buffer = "";
};
util.inherits(StreamReader, EventEmitter);

/**
 * @event data
 */
/**
 * @event closed
 */

StreamReader.prototype._getReadStream = function (filepath, encoding) {
  var Encoding = require("../text/encoding");
  var reader = null;

  switch (encoding) {
    case Encoding.ASCII:
    case Encoding.UTF8:
    case Encoding.UTF16LE:
    case Encoding.UCS2:
    case Encoding.BASE64:
    case Encoding.LATIN1:
    case Encoding.Binary:
    case Encoding.HEX:
      reader = fs.createReadStream(filepath, { highWaterMark: 4, encoding: encoding });
      break;
    default:
      var i18n = require("iconv-lite");
      reader = fs.createReadStream(filepath).pipe(i18n.decodeStream(encoding));
      break;
  }

  return reader;
};

/**
 * Read by char.
 * @public
 * @param   {function}  callback  Callback function which is called when stream read a character.
 */
StreamReader.prototype.read = function (callback) {
  var stream = this._stream;

  stream.on("data", (chunk) => {
    var arr = chunk.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]|[^\uD800-\uDFFF]/g) || [];
    for (let char of arr) {
      calllback && callback(char);
      this.emit("data", char);
    }
  });
  stream.on("end", () => {
    this.emit("closed");
  })
};

/**
 * Read by block.
 * @public
 * @param   {function}  callback  Callback function that is called when "data" event is executed.
 */
StreamReader.prototype.readBlock = function (callback) {
  var stream = this._stream;

  stream.on("data", (chunk) => {
    callback && callback(chunk);
    this.emit("data", chunk);
  })
  stream.on("end", () => {
    this.emit("closed");
  })
};

/**
 * @public
 * @param   {function}  callback Callback function which is called when the stream read a line.
 */
StreamReader.prototype.readLine = function (callback) {
  var stream = this._stream;

  stream.on("data", (chunk) => {
    stream.pause();
    this._buffer += chunk;
    var extractLine = function () {
      var buffer = this._buffer;
      var line, text;
      [line, text] = buffer.match(/(.*)[\r\n]+/) || [null, null];
      if (line) {
        this._buffer = buffer.slice(line.length);
        this.emit("data", text);
        process.nextTick(() => { extractLine.call(this); });
      } else {
        stream.resume();
      }
    };
    extractLine.call(this);
  });
  stream.on("end", () => {
    if (this._buffer && this._buffer.length > 0) {
      callback && callback(this._buffer);
      this.emit("data", this._buffer);
    }
    this.emit("closed");
  });
};

/**
 * @public
 * @param   {function}  callback  Callback function which is called when the steam read all text strings.
 */
StreamReader.prototype.readToEnd = function (callback) {
  var stream = this._stream;
  var buffer = "";

  stream.on("data", (chunk) => {
    buffer += chunk;
  });
  stream.on("end", () => {
    callback && callback(buffer);
    this.emit("data", buffer);
    this.emit("closed");
  });
};

module.exports = StreamReader;