var fs = require("fs");
var StreamReader = require("./streamreader");
var { EventEmitter } = require("events");
var util = require("util");

/**
 * @class         CSV file reader class.
 * 
 * @public
 * @constructor   Create and initialize CsvReader class.
 * @param {string} filepath 
 * @param {string} [encoding] 
 */
var CsvReader = function (filepath, encoding) {
  this._stream = new StreamReader(filepath, encoding);
};
util.inherits(CsvReader, EventEmitter);

/**
 * @event data
 */
/**
 * @event closed
 */

/**
 * @public
 * @param   {function}  callback
 */
CsvReader.prototype.readRow = function (callback) {
  var stream = this._stream;
  var line = "";
  var record = [];
  var field = "";
  var isQuotedField = false;

  stream.on("data", (data) => {
    var arr = data.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]|[^\uD800-\uDFFF]/g) || [];
    for (var i = 0; i < arr.length; i++) {
      var char = arr[i];
      if (char === "," && !isQuotedField) {
        record.push(field);
        field = "";
      } else if (char === "\"") {
        if (!isQuotedField) {
          if (!field) {
            isQuotedField = true;
            continue;
          } else {
            if (i + 1 > line.length) {
              isQuotedField = false;
              continue;
            }
          }
        }

        var peek = arr[i + 1];

        if (peek === "\"") {
          field += "\"";
          i += 1;
        } else if (peek === "," && isQuotedField) {
          isQuotedField = false;
          i += 1;
          record.push(field);
          field = "";
        }
      } else {
        field += char;
      }
    }

    if (isQuotedField) {
      field += "\r\n";
    } else {
      record.push(field);
      callback(record);
      this.emit("data", record);
      record = [];
      field = "";
      isQuotedField = false;
    }
  });
  stream.on("closed", () => {
    this.emit("closed");
  });

  // execute reading line.
  stream.readLine();
};

/**
 * @public
 * @param   {function}  callback
 */
CsvReader.prototype.raedToEnd = function (callback) {
  var stream = this._stream;
  var buffer = [];

  this.readRow((row) => {
    buffer.push(row);
  });

  stream.on("closed", () => {
    callback(buffer);
    this.emit("data", buffer);
    this.emit("closed");
  })
};

module.exports = CsvReader;