const { Merver, Responder, Middler, classics } = require("./merver.js");

const middleWare = new Middler();

middleWare.addMiddleware((req, res) =>
  console.log(`${req.method} request to ${req.url}`)
);

const middleWare2 = new Middler();

middleWare2.addMiddleware((req, res) => console.log("I am middleware 2!"));

const responder = new Responder();

responder.newResponse({
  endpoint: "/",
  GET: (req, res) => {
    return res.html(`<h1>Hello World</h1>`);
  },
  // middler: middleWare2
});

responder.newResponse({
  endpoint: "/:cheese",
  GET: (req, res) => {
    return res.json(req.params);
  },
  // middler: middleWare2
});

const app = new Merver({
  PORT: 4001,
  responder,
  middler: middleWare,
  // serveStatic: true,
});

app.listen();
