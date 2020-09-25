var http = require("http");
var https = require("https");
var querystring = require("querystring");
var i18n = require("iconv-lite");

var getProtocol = function (protocol) {
  switch (protocol) {
    case "http:":
      return http;
    case "https:":
      return https;
    default:
      throw new Error("protocol error.");
  }
};

var WebClient = function () {

};

/**
 * Send http request.
 * @param   {string}    options.url         URL.
 * @param   {string}    options.method      Request method.
 * @param   {object}    options.data        Request data.
 * @param   {string}    options.contentType Request content-type.
 * @param   {string}    options.encoding    Request/respons encoding.
 * @param   {object}    options.headers     Request headers. Key-value object.
 * @param   {string}    options.username    Basic authentication username.
 * @param   {string}    options.password    Basic authentication password.
 * @param   {function}  options.error       Call back function that is called when error occured.
 * @param   {function}  options.success     Call back function that is caleed when request is success.
 */
WebClient.request = function (options) {
  switch ((options.method || "GET").toUpperCase()) {
    case "GET":
    case "HEAD":
    case "DELETE":
    case "CONNECT":
    case "OPTIONS":
    case "TRACE":
      return WebClient.read(options);
    default:
      return WebClient.write(options);
  }
};

WebClient.get = function (optioins) {
  optioins.method = "GET";
  return WebClient.read(optioins);
};

WebClient.head = function (optioins) {
  optioins.method = "HEAD";
  return WebClient.read(optioins);
};

WebClient.post = function (optioins) {
  optioins.method = "POST";
  return WebClient.write(optioins);
};

WebClient.put = function (optioins) {
  optioins.method = "PUT";
  return WebClient.write(optioins);
};

WebClient.delete = function (optioins) {
  optioins.method = "DELETE";
  return WebClient.read(optioins);
};

WebClient.connect = function (optioins) {
  optioins.method = "CONNECT";
  return WebClient.read(optioins);
};

WebClient.options = function (options) {
  optioins.method = "OPTIONS";
  return WebClient.read(optioins);
};

WebClient.trace = function (options) {
  optioins.method = "TRACE";
  return WebClient.read(optioins);
};

WebClient.patch = function (options) {
  optioins.method = "PATCH";
  return WebClient.write(optioins);
};

/**
 * Send "GET", "HEAD", "DELETE", "CONNECT", "OPTIONS, ""TRACE"  request.
 */
WebClient.read = function (options) {
  var url, search, req, protocol;

  // Create request URL.
  url = require("url").parse(options.url);

  search = url.search ? url.search + "&" : (options.data ? "?" : "");
  switch (typeof (options.data)) {
    case "object":
      search += querystring.stringify(options.data);
      break;
    case "string":
      search += querystring.escape(options.data);
      break;
  }

  // Get protocol.
  protocol = getProtocol(url.protocol);

  // Create and execute request.
  req = protocol.request({
    protocol: url.protocol || "http:",
    host: url.hostname || "localhost",
    port: url.port,
    method: options.method || "GET",
    path: (url.pathname + search),
    headers: options.headers,
    auth: (options.username && optioins.password) ? `${options.username}:${options.password}` : undefined
  }, (res) => {
    WebClient.onresponse.call(this, req, res, options);
  });
  req.on("error", (err) => {
    options.error && options.error.call(this, err);
  });

  req.end();
};

/**
 * Send "POST", "PUT", "PATCH" request.
 */
WebClient.write = function (options) {
  var url, body, headers, contentType, req, protocol;

  // Create request URL.
  url = require("url").parse(options.url);

  // Get protocol.
  protocol = getProtocol(url.protocol);

  // Get content-type.
  headers = options.headers || {};
  contentType = headers["Content-Type"] = options.contentType || headers["Content-Type"] || "application/json";

  // Create request body.
  if (options.data && typeof (options.data) === "object") {
    switch (contentType) {
      case "application/json":
        body = JSON.stringify(options.data);
        break;
      case "application/x-www-form-urlencoded":
        body = querystring.stringify(options.data);
        break;
      default:
        body = querystring.escape(options.data);
        break;
    }
  } else {
    body = querystring.escape(options.data);
  }

  // Create request headers.
  if (body !== undefined) {
    headers["Content-Length"] = headers["Content-Length"] || Buffer.byteLength(body);
  }

  // Create and execute request.
  req = protocol.request({
    protocol: url.protocol || "http:",
    host: url.hostname || "localhost",
    port: url.port,
    method: options.method || "POST",
    path: (url.pathname + (url.search || "")),
    headers,
    auth: (options.username && optioins.password) ? `${options.username}:${options.password}` : undefined
  }, (res) => {
    WebClient.onresponse.call(this, req, res, options);
  });
  req.on("error", (err) => {
    options.error && options.error.call(this, err);
  });
  body && req.write(body);
  req.end();
};

/**
 * When call response event is occured.
 */
WebClient.onresponse = function (req, res, options) {
  var data = "";
  var encoding = (options.encoding || "").toLowerCase();
  if (encoding && encoding !== "utf-8" && encoding !== "utf8") {
    res = res.pipe(i18n.decodeStream(options.encoding))
      .pipe(i18n.encodeStream("UTF-8"));
  }
  res.on("data", (chunk) => {
    data += chunk;
  });
  res.on("end", () => {
    res.data = data;
    options.success && options.success.call(this, req, res);
  });
};

module.exports = WebClient;