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

var createQueryString = function (url, query) {
  var search;
  search = url.search ? url.search + "&" : (query ? "?" : "");
  switch (typeof (query)) {
    case "object":
      search += querystring.stringify(query);
      break;
    case "string":
      search += querystring.escape(query);
      break;
  }
  return search;
};

var isTextType = function (contentType) {
  if (contentType.indexOf("text/") >= 0 ||
    contentType.indexOf("application/json") >= 0) {
    return true;
  } else {
    return false;
  }
};

var WebClient = function () {

};

/**
 * Send http request.
 * @param   {string}    options.url         URL.
 * @param   {string}    options.method      Request method.
 * @param   {object}    options.data        Request data. 
 * @param   {object}    options.query       Request query string.
 * @param   {object}    options.body        Request body.
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

WebClient.get = function (options) {
  options.method = "GET";
  return WebClient.read(options);
};

WebClient.head = function (options) {
  options.method = "HEAD";
  return WebClient.read(options);
};

WebClient.post = function (options) {
  options.method = "POST";
  return WebClient.write(options);
};

WebClient.put = function (options) {
  options.method = "PUT";
  return WebClient.write(options);
};

WebClient.delete = function (options) {
  options.method = "DELETE";
  return WebClient.read(options);
};

WebClient.connect = function (options) {
  options.method = "CONNECT";
  return WebClient.read(options);
};

WebClient.options = function (options) {
  options.method = "OPTIONS";
  return WebClient.read(options);
};

WebClient.trace = function (options) {
  options.method = "TRACE";
  return WebClient.read(options);
};

WebClient.patch = function (options) {
  options.method = "PATCH";
  return WebClient.write(options);
};

/**
 * Send "GET", "HEAD", "DELETE", "CONNECT", "OPTIONS, ""TRACE"  request.
 */
WebClient.read = function (options) {
  var url, search, req, protocol, query;

  // Create request URL.
  url = require("url").parse(options.url);
  search = createQueryString(url, (options.data ? options.data : options.query));

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
    auth: (options.username && options.password) ? `${options.username}:${options.password}` : undefined
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
  var url, query, body, headers, contentType, req, protocol;

  // Create request URL.
  url = require("url").parse(options.url);
  search = createQueryString(url, options.query);

  // Get protocol.
  protocol = getProtocol(url.protocol);

  // Get content-type.
  headers = options.headers || {};
  contentType = headers["Content-Type"] = options.contentType || headers["Content-Type"] || "application/json";

  // Create request body.
  body = options.data ? options.data : options.body;
  if (body && typeof (body) === "object") {
    switch (contentType) {
      case "application/json":
        body = JSON.stringify(body);
        break;
      case "application/x-www-form-urlencoded":
        body = querystring.stringify(body);
        break;
      default:
        body = querystring.escape(body);
        break;
    }
  } else {
    body = querystring.escape(body);
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
    path: (url.pathname + search),
    headers,
    auth: (options.username && options.password) ? `${options.username}:${options.password}` : undefined
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
  var contentType = res.headers["content-type"] || "";

  if (!isTextType(contentType)) {
    options.success.call(this, req, res);
    return;
  }

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
    res.data = (contentType.indexOf("application/json") >= 0) ? JSON.parse(data) : data;
    options.success && options.success.call(this, req, res);
  });
};

module.exports = WebClient;