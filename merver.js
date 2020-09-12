const http = require("http");
const url = require("url");
const { matchurls } = require("./params");
const querystring = require("querystring");
const nodeStatic = require("node-static");

// +& MIDDLEWARE FOR ADDING CLASSIC RESPONSE FUNCIONS

const classics = (req, res) => {
  req.query = url.parse(req.url, true).query;

  res.json = (obj, status = 200) => {
    if (!res.headersSent) {
      try {
        res.writeHead(status, { "Content-Type": "application/json" });
        res.write(JSON.stringify(obj));
      } catch (err) {
        console.error(err);
        res.write(JSON.stringify(err));
      }
      return res.end();
    } else {
      console.log(
        "Request already has been responded too, if not intended, consider extending the resTimeout config to facilitate time for promises to resolve"
      );
    }
  };

  res.html = (html, status = 200) => {
    if (!res.headersSent) {
      try {
        res.writeHead(status, { "Content-Type": "text/html" });
        res.write(html);
      } catch (err) {
        console.error(err);
        res.write(JSON.stringify(err));
      }
      return res.end();
    } else {
      console.log(
        "Request already has been responded too, if not intended, consider extending the resTimeout config to facilitate time for promises to resolve"
      );
    }
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

  bodyParser(req, res) {
    switch (req.headers["content-type"]) {
      case "application/json":
        req.body = JSON.parse(req.body);
        break;
      case "application/x-www-form-urlencoded":
        req.body = querystring.decode(req.body);
        break;
    }
  }
}

// +& Responder Object for Creating Routes

class Responder {
  constructor() {
    this.response = [];
  }

  respond(req, res) {
    this.response.forEach((route) => {
      try {
        if (matchurls(route.endpoint, url.parse(req.url).pathname, req)) {
          route.middler ? route.middler.runMiddleware(req, res) : null;
          if (route[req.method]) {
            route[req.method](req, res);
          } else {
            res.json({ error: "no response for this verb" }, 400);
          }
        }
      } catch (err) {
        res.json({ err }, 400);
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
    this.mwTimeout = config.mwTimeout || 10;
    this.resTimeout = config.resTimeout || 500;
    this.serveStatic = config.serveStatic;
    this.publicFolder = config.publicFolder || "./public";
    this.cache = config.cache || 3000;
    this.static = new nodeStatic.Server(this.publicFolder, {
      cache: this.cache,
    });
    this.server = http.createServer((req, res) => {
      try {
        //classic methods (req.query, res.html, res.json) are added
        classics(req, res);

        const bodyPromise = new Promise((done, fail) => {
          //Receive Request Body
          let body = [];
          req
            .on("error", (err) => {
              console.error(err);
              res.json({ err });
              fail(err);
            })
            .on("data", (chunk) => {
              body.push(chunk);
            })
            .on("end", () => {
              req.body = Buffer.concat(body).toString();
              done();
            });
        });

        //Handle Response Errors
        res.on("error", (err) => {
          console.error(err);
          res.json({ err });
        });

        //CORS HEADERS
        res.setHeader("Access-Control-Allow-Origin", this.allowOrigin);
        res.setHeader("Access-Control-Request-Method", this.requestMethod);
        res.setHeader("Access-Control-Allow-Methods", this.allowMethods);
        res.setHeader("Access-Control-Allow-Headers", this.allowHeaders);

        //Handle request after body has been streamed
        let mwPromise;
        let resPromise;
        bodyPromise.then(() => {
          //MIDDLEWARE PROMISE
          mwPromise = new Promise((done, fail) => {
            this.middler.runMiddleware(req, res);
            setTimeout(done, this.mwTimeout);
          });

          //ROUTE PROMISE
          resPromise = new Promise((done, fail) => {
            this.responder.respond(req, res);
            setTimeout(done, this.resTimeout);
          });

          //Serve Files

          //Failed Response if both promises timeout
          Promise.all([mwPromise, resPromise]).then(() => {
            if (res.headersSent) {
            } else {
              if (this.serveStatic) {
                this.static.serve(req, res, function (err, result) {
                  if (err) {
                    // There was an error serving the file
                    console.error(
                      "Error serving " + req.url + " - " + err.message
                    );

                    // Respond to the client
                    res.json({ err });
                  }
                });
              } else {
                if (!res.headersSent) {
                  res.json(
                    { error: `no response for ${req.method} ${req.url}` },
                    400
                  );
                }
              }
            }
          });
        });
      } catch (err) {
        console.error(err);
        res.json({ err: `No Response for ${req.method} - ${req.url}` }, 400);
      }
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
};
