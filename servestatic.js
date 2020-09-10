const url = require("url");
const fs = require("fs");
const path = require("path");

const mimeType = {
  ".ico": "image/x-icon",
  ".html": "text/html",
  ".js": "text/javascript",
  ".json": "application/json",
  ".css": "text/css",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".wav": "audio/wav",
  ".mp3": "audio/mpeg",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
  ".zip": "application/zip",
  ".doc": "application/msword",
  ".eot": "application/vnd.ms-fontobject",
  ".ttf": "application/x-font-ttf",
};

// +& MIDDLEWARE FOR ADDING CLASSIC RESPONSE FUNCIONS
// ! Borrowed from https://stackabuse.com/node-http-servers-for-static-file-serving/
const serveStatic = function (req, res) {
  var resolvedBase = path.resolve(req.publicFolder);
  var safeSuffix = path.normalize(req.url).replace(/^(\.\.[\/\\])+/, "");
  var fileLoc = path.join(resolvedBase, safeSuffix);

  fs.readFile(fileLoc, function (err, data) {
    if (data) {
      res.statusCode = 200;
      const ext = path.parse(fileLoc).ext;
      console.log(ext);
      res.write(data);
      res.setHeader("Content-type", mimeType[ext] || "text/plain");
    }
    if (err) {
      res.json({ err });
    }
    // return res.end();
  });
};

module.exports = {
  serveStatic,
};
