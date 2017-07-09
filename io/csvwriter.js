var fs = require("fs");
var StreamWriter = require("./streamwriter");
var { EventEmitter } = require("events");
var util = require("util");

/**
 * @class         CSV file writer class.
 * 
 * @public
 * @constructor   Create and initialize CsvWriter class.
 * @param {string} filepath 
 * @param {string} [encoding]
 * @param {object} [options]
 */
var CsvWriter = function (filepath, encoding, options) {
  this._stream = this._createStreamWriter(filepath, encoding);
  this._options = this._initializeOptions(options);
  this._stringify = this._getStringify(this.options.escape);

  if (this._options.header) {
    this.writeRow(this._options.header);
  }
};
util.inherits(CsvWriter, EventEmitter);

/**
 * @event flushed
 */
/**
 * @event closed
 */

CsvWriter.prototype._createStreamWriter = function (filepath, encoding) {
  var stream = new StreamWriter(filepath, encoding);
  stream.on("flushed", () => {
    this.emit("flushed");
  })
  stream.on("closed", () => {
    this.emit("closed");
  })
  return stream;
};

CsvWriter.prototype._initializeOptions = function (specified) {
  return {
    header: ("header" in specified ? specified.heder : null),
    escape: ("escape" in specified ? specified.escape : "auto"),  // force, auto, none
    newline: ("eol" in specified ? specified.eol : require("os").EOL)
  };
};

CsvWriter.prototype._getStringify = function (escape) {
  var stringify;

  switch (escape) {
    case "force":
      stringify = function (value) {
        value = value.replace(/"/g, "\"\"");
        return `"${value}"`;
      };
      break;
    case "none":
      stringify = function (value) {
        return value;
      };
      break;
    case "auto":
      stringify = function (value) {
        if (/[,"\r\n]+/.test(value)) {
          value = value.replace(/"/g, "\"\"");
          return `"${value}"`;
        } else {
          return value;
        }
      };
      break;
  }

  return stringify;
}

/**
 * @public
 * @param   {string[][]}   data
 */
CsvWriter.prototype.write = function (data) {
  for (var row of data) {
    this.writeRow(row);
  }
};

/**
 * @public
 * @param   {string[]}   row
 */
CsvWriter.prototype.writeRow = function (row) {
  var text = "";
  var stream = this._stream;
  var options = this._options;
  var stringify = this._stringify;
  var NL = options.newline;

  for (var cell of row) {
    text += stringify(cell);
    text += ",";
  }

  text = text.substr(0, text.length - 1);

  stream.writeLine(text);
};

/**
 * @public
 * @param   {function}  callback
 */
CsvWriter.prototype.flush = function (callback) {
  this._stream.flush(callback);
};

/**
 * @public
 * @param   {function}  callback
 */
CsvWriter.prototype.close = function (callback) {
  this._stream.close(callback);
};

module.exports = CsvWriter;
