# Merver

Merver is a Micro HTTP Server for JSON apis and Microservices or even as stepping stone to building more robust backend solutions.

Merver is made up of three main classes to give it a modular approach, Merver, Middler, and Responder.

**Merver** - This is your web server that listens for requests

**Middler** - each middler object allows you to create a chain of middleware which can be attached to Mervers to used before every request or attached to response objects created by a Responder to be run before the controller functions of that particular endpoint.

**Responder** - An object that can create and maintains potential request responses which is attached to a Merver at construction.
