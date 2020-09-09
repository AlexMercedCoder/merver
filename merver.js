const http = require("http");
const url = require("url");

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

const classics = (req, res) => {
  req.query = url.parse(req.url, true).query;

  res.json = (obj) => {
    try {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.write(JSON.stringify(obj));
    } catch (err) {
      res.write(JSON.stringify(err));
    }
    return res.end();
  };

  res.html = (html) => {
    try {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.write(html);
    } catch (err) {
      res.write(err);
    }
    return res.end();
  };
};

// +& MIDDLE OBJECT FOR RUNNING MIDDLEWARE

class Middler {
  constructor() {
    this.middleware = [];
  }

  addMiddleware(middleware) {
    this.middleware.push(middleware);
  }

  runMiddleware(req, res) {
    this.middleware.forEach((mw) => mw(req, res));
  }
}

// +& Responder Object for Creating Routes

class Responder {
  constructor() {
    this.response = [];
  }

  respond(req, res) {
    this.response.forEach((route) => {
      if (url.parse(req.url).pathname === route.endpoint) {
        route.middler ? route.middler.runMiddleware(req, res) : null;
        route[req.method](req, res);
      }
    });
  }

  newResponse(route) {
    this.response.push(route);
  }
}

// +& Merver for creating Server

class Merver {
  constructor(config) {
    this.PORT = config.PORT;
    this.responder = config.responder || new Responder();
    this.middler = config.middler || new Middler();
    this.allowOrigin = config.allowOrigin || "*";
    this.requestMethod = config.requestMethod || "*";
    this.allowMethods = config.allowMethods || "OPTIONS, GET";
    this.allowHeaders = config.allowHeaders || "*";
    // this.serveStatic = config.serveStatic;
    // this.publicFolder = config.publicFolder || "./public";
    this.server = http.createServer((req, res) => {
      console.log(res._headerSent);

      //CORS HEADERS
      res.setHeader("Access-Control-Allow-Origin", this.allowOrigin);
      res.setHeader("Access-Control-Request-Method", this.requestMethod);
      res.setHeader("Access-Control-Allow-Methods", this.allowMethods);
      res.setHeader("Access-Control-Allow-Headers", this.allowHeaders);

      this.middler.runMiddleware(req, res);
      this.responder.respond(req, res);

      if (res.headersSent) {
      } else {
        // if (this.serveStatic) {
        //   req.publicFolder = this.publicFolder;
        //   serveStatic(req, res);
        // }
        res.write("No Response");
        return res.end();
      }
      return 0;
    });
  }

  listen(callback) {
    this.server.listen(this.PORT);
    console.log(`Listening on port ${this.PORT}`);
    callback ? callback() : null;
  }
}

module.exports = {
  Responder,
  Merver,
  Middler,
  classics,
};
