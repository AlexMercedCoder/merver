# Merver

Merver is a Micro HTTP Server for JSON apis and Microservices or even as stepping stone to building more robust backend solutions.

Merver is made up of three main classes to give it a modular approach, Merver, Middler, and Responder.

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
**allowOrigin:** value of "Access-Control-Allow-Origin" header, defaults to "_"
**requestMethod:** value of "Access-Control-Request-Method" header, defaults to "_"
**allowMethods:**value of "Access-Control-Allow-Methods" header, defaults to "OPTIONS, GET"
**allowHeaders:**value of "Access-Control-Allow-Headers" header, defaults to "\*"

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
  endpoint: "/cheese",
  GET: (req, res) => {
    console.log(res.query);
    return res.json({ Hello: "world" });
  },
  // middler: middleWare2
});
```

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

## Other

res.json(response) => method of the response object that sends a JSON response

res.html(response) => method the response object that sends response as html string

req.query => object of all URL query keys and values
