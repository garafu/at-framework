var Encoding = function () {
};

// Node.js default encodings.
Encoding.ASCII = "ascii";
Encoding.UTF8 = "utf8";
Encoding.UTF16LE = "utf16le";
Encoding.UCS2 = "ucs2";
Encoding.BASE64 = "base64";
Encoding.LATIN1 = "latin1";
Encoding.Binary = "binary";
Encoding.HEX = "hex";

// iconv-lite encodings.
Encoding.UTF16BE = "utf-16be";
Encoding.UTF16 = "utf-16";
Encoding.Codepage874 = "cp874";
Encoding.Codepage1250 = "cp1250";
Encoding.Codepage1251 = "cp1251";
Encoding.Codepage1252 = "cp1252";
Encoding.Codepage1253 = "cp1253";
Encoding.Codepage1254 = "cp1254";
Encoding.Codepage1255 = "cp1255";
Encoding.Codepage1256 = "cp1256";
Encoding.Codepage1257 = "cp1257";
Encoding.Codepage1258 = "cp1258";
Encoding.ShiftJIS = "shiftjis";
Encoding.Windows31j = "windows31j";
Encoding.Windows932 = "windows932";
Encoding.EUCJP = "euc-jp";

module.exports = Encoding;