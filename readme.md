# Merver

Merver is a Micro HTTP Server for JSON apis and Microservices or even as stepping stone to building more robust backend solutions.

Merver is made up of three main classes to give it a modular approach, Merver, Middler, and Responder.

SPIN UP A TEMPLATE PROJECT: `npx merced-spinup merver projectName`

**Merver** - This is your web server that listens for requests

**Middler** - each middler object allows you to create a chain of middleware which can be attached to Mervers to used before every request or attached to response objects created by a Responder to be run before the controller functions of that particular endpoint.

**Responder** - An object that can create and maintains potential request responses which is attached to a Merver at construction.

## Merver

The merver object creates an http server, its constructor can be passed a config option that configures how the server works...

```js
const app = new Merver({
  PORT: 4001,
  responder,
  middler: middleWare,
});

app.listen();
```

**PORT:** The Port number to listen on

**responder:** A responder object which carries all the routes for this application

**middler:** A middler object which has the global middleware registered to it, will be run before the responder on every request

**allowOrigin:** value of "Access-Control-Allow-Origin" header, defaults to "\_"

**requestMethod:** value of "Access-Control-Request-Method" header, defaults to "\_"

**allowMethods:**value of "Access-Control-Allow-Methods" header, defaults to "OPTIONS, GET"

**allowHeaders:**value of "Access-Control-Allow-Headers" header, defaults to "\*"

**mwTimeout:**Amount of time in milliseconds before middleware timesout, useful if a lot of async processes in your middleware you want completed before responses. Defaults to 10 milliseconds

**resTimeout:**Amount of time in milliseconds before routes timeout, useful if a lot of your routes complete async tasks like db call, defaults to 200 milliseconds.

- When both timeouts occur the request will get a default "no response"

**serveState:** boolean that determines whether files will be served statically or not

**publicFolder:** property that says which folder to serve as a static folder, defaults to "./public"

**cache:** property that determines how long files serve should be cached for

### methods

instance.listen(callback) - Starts the server listener, will run a callback after starting listener if one is passed.

## Responder

```js
const responder = new Responder();

responder.newResponse({
  endpoint: "/",
  GET: (req, res) => {
    console.log(res.query);
    return res.html(`<h1>Hello World</h1>`);
  },
  // middler: middleWare2
});

responder.newResponse({
  endpoint: "/cheese/:param",
  GET: (req, res) => {
    console.log(res.query);
    return res.json({ Hello: "world" });
  },
  // middler: middleWare2
});
```

*be careful with params as they may capture reference to static files, for example the route "/:param" will end up prioritized over "/index.html"*

The Responder Object registers routes and their responses. There is one method...

**responder.newResponse(config):** Pass a new route object which has the following properties...

- endpoint: the url string to match against (URL PARAMS CURRENTLY NOT SUPPORTED)
- [VERB]: a function to be run for a request to the endpoint of that particular verb, format of the function is (request, response) => {}
- middler: a middler object to run middleware only for this route

## Middler

Each middler object registers its own unique of middleware functions which can be bound globally to a Merver object or to a specific responder route.

```js
const middleWare = new Middler();

middleWare.addMiddleware((req, res) =>
  console.log(`${req.method} request to ${req.url}`)
);

const middleWare2 = new Middler();

middleWare2.addMiddleware((req, res) => console.log("I am middleware 2!"));
```

### built-in middleware

middler.bodyparser - can handle json and urlencoded data

```js
middleware.addMiddleware(middleware.bodyparser);
```

## Other

res.json(response) => method of the response object that sends a JSON response

res.html(response) => method the response object that sends response as html string

req.query => object of all URL query keys and values

req.params => object with any url params which are denoted using "/:param/" in your routes.

## Running Merver via HTTPS

Merver.init() the server callback function seperated from the http object in case you'd like to pass it to an http server. Here you go!

```js
const Merver = require('merver)
const fs = require('fs')
const https = require('https')
const config = require('./config.js')
const app = new Merver(config)

https.createServer({
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.cert')
}, (req, res) => app.init(req, res, app))
.listen(3000, function () {
  console.log('Example app listening on port 3000! Go to https://localhost:3000/')
})
```