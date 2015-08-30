# toxy [![Build Status](https://api.travis-ci.org/h2non/toxy.svg?branch=master&style=flat)](https://travis-ci.org/h2non/toxy) [![Code Climate](https://codeclimate.com/github/h2non/toxy/badges/gpa.svg)](https://codeclimate.com/github/h2non/toxy) [![NPM](https://img.shields.io/npm/v/toxy.svg)](https://www.npmjs.org/package/toxy)

<img align="right" height="180" src="http://s8.postimg.org/ikc9jxllh/toxic.jpg" />

**toxy** is a fully programmatic and **hackable HTTP proxy** to **simulate** server **failure scenarios** and **unexpected network conditions**, built for [node.js](http://nodejs.org)/[io.js](https://iojs.org).

It was mainly designed for fuzzing/evil testing purposes, when toxy becomes particularly useful to cover fault tolerance and resiliency capabilities of a system, especially in [service-oriented](http://microservices.io/patterns/index.html) architectures, where toxy may act as intermediate proxy among services.

toxy allows you to plug in [poisons](#poisons), optionally filtered by [rules](#rules), which essentially can intercept and alter the HTTP flow as you need, performing multiple evil actions in the middle of that process, such as limiting the bandwidth, delaying TCP packets, injecting network jitter latency or replying with a custom error or status code.
It operates only at L7 (application level).

toxy can be fluently used [programmatically](#programmatic-api) or via [HTTP API](#http-api).
It's compatible with [connect](https://github.com/senchalabs/connect)/[express](http://expressjs.com), and it was built on top of [rocky](https://github.com/h2non/rocky), a full-featured middleware-oriented HTTP proxy.

Requires node.js +0.12 or io.js +1.6

## Contents

- [Features](#features)
- [Introduction](#introduction)
  - [Why toxy?](#why-toxy)
  - [Concepts](#concepts)
  - [How it works](#how-it-works)
- [Usage](#usage)
  - [Installation](#installation)
  - [Examples](#examples)
- [Poisons](#poisons)
  - [Built-in poisons](#built-in-poisons)
    - [Latency](#latency)
    - [Inject response](#inject-response)
    - [Bandwidth](#bandwidth)
    - [Rate limit](#rate-limit)
    - [Slow read](#slow-read)
    - [Slow open](#slow-open)
    - [Slow close](#slow-close)
    - [Throttle](#throttle)
    - [Abort connection](#abort-connection)
    - [Timeout](#timeout)
  - [How to write poisons](#how-to-write-poisons)
- [Rules](#rules)
  - [Built-in rules](#built-in-rules)
    - [Probability](#probability)
    - [Method](#method)
    - [Headers](#headers)
    - [Content Type](#content-type)
    - [Body](#body)
  - [How to write rules](#how-to-write-rules)
- [Programmatic API](#programmatic-api)
- [HTTP API](#http-api)
  - [Usage](#usage)
  - [Authorization](#authorization)
  - [API](#api)
  - [Programmatic API](#programmatic-api-1)
- [License](#license)

## Features

- Full-featured HTTP/S proxy (backed by [rocky](https://github.com/h2non/rocky) and [http-proxy](https://github.com/nodejitsu/node-http-proxy))
- Hackable and elegant programmatic API (inspired on connect/express)
- Admin HTTP API for external management and dynamic configuration
- Featured built-in router with nested configuration
- Hierarchical and composable poisioning with rule based filtering
- Hierarchical middleware layer (both global and route scopes)
- Easily augmentable via middleware (based on connect/express middleware)
- Built-in poisons (bandwidth, error, abort, latency, slow read...)
- Rule-based poisoning (probabilistic, HTTP method, headers, body...)
- Support third-party poisons and rules
- Built-in balancer and traffic intercept via middleware
- Inherits API and features from [rocky](https://github.com/h2non/rocky)
- Compatible with connect/express (and most of their middleware)
- Able to run as standalone HTTP proxy

## Introduction

### Why toxy?

There're some other similar solutions like `toxy` in the market, but most of them do not provide a proper programmatic control and usually are not easy to hack, configure and/or extend. Additionally, most of the those solutions only operate at TCP L3 level stack instead of providing high-level abstraction to cover common requirements in the specific domain and nature of the HTTP L7 protocol, like toxy does.

toxy provides a powerful hackable and extensible solution with a convenient abstraction, but without losing a convenient low-level interface capabilities to deal with HTTP protocol primitives properly.

toxy was designed based on the rules of composition, simplicity and extensibility. 
Via its middleware layer you can easily augment toxy features to your own needs.

### Concepts

`toxy` introduces two core directives that you can plug in the proxy and should knowing before using: poisons and rules.

**Poisons** are the specific logic to infect an incoming or outgoing HTTP flow (e.g: injecting a latency, replying with an error). HTTP flow can be poisoned by one or multiple poisons, and poisons can be plugged to infect both global or route level incoming traffic.

**Rules** are a kind of validation filters that can be reused and applied to global incoming HTTP traffic, route level traffic or into a specific poison. Their responsability is to determine, via inspecting each incoming HTTP request, if the registered poisons should be enabled or not, and therefore infecting or not the HTTP traffic (e.g: match headers, query params, method, body...).

### How it works

```
↓   ( Incoming request )  ↓
↓           |||           ↓
↓     ----------------    ↓
↓     |  Toxy Router |    ↓ --> Match the incoming request
↓     ----------------    ↓
↓           |||           ↓
↓     ----------------    ↓
↓     |  Exec Rules  |    ↓ --> Apply configured rules for the request
↓     ----------------    ↓
↓           |||           ↓
↓     ----------------    ↓
↓     | Exec Poisons |    ↓ --> If all rules passed, then poison the HTTP flow
↓     ----------------    ↓
↓        /       \        ↓
↓        \       /        ↓
↓   -------------------   ↓
↓   | HTTP dispatcher |   ↓ --> Proxy the HTTP traffic, either poisoned or not
↓   -------------------   ↓
```

## Usage

### Installation

```
npm install toxy
```

### Examples

See [examples](https://github.com/h2non/toxy/tree/master/examples) directory for more use cases.

```js
var toxy = require('toxy')
var poisons = toxy.poisons
var rules = toxy.rules

// Create a new toxy proxy
var proxy = toxy()

// Default server to forward incoming traffic
proxy
  .forward('http://httpbin.org')

// Register global poisons and rules
proxy
  .poison(poisons.latency({ jitter: 500 }))
  .rule(rules.probability(25))

// Register multiple routes
proxy
  .get('/download/*')
  .forward('http://files.myserver.net')
  .poison(poisons.bandwidth({ bps: 1024 }))
  .withRule(rules.headers({'Authorization': /^Bearer (.*)$/i }))

proxy
  .get('/image/*')
  .poison(poisons.bandwidth({ bps: 512 }))

proxy
  .all('/api/*')
  .poison(poisons.rateLimit({ limit: 10, threshold: 1000 }))
  .withRule(rules.method(['POST', 'PUT', 'DELETE']))
  // And use a different more permissive poison for GET requests
  .poison(poisons.rateLimit({ limit: 50, threshold: 1000 }))
  .withRule(rules.method('GET'))

// Handle the rest of the traffic
proxy
  .all('/*')
  .poison(poisons.slowClose({ delay: 1000 }))
  .poison(poisons.slowRead({ bps: 128 }))
  .withRule(rules.probability(50))

proxy.listen(3000)
console.log('Server listening on port:', 3000)
console.log('Test it:', 'http://localhost:3000/image/jpeg')
```

## Poisons

Poisons host specific logic which intercepts and mutates, wraps, modify and/or cancel an HTTP transaction in the proxy server.
Poisons can be applied to incoming or outgoing, or even both traffic flows.

Poisons can be composed and reused for different HTTP scenarios.
They are executed in FIFO order and asynchronously.

### Built-in poisons

#### Latency
Name: `latency`

Infects the HTTP flow injecting a latency jitter in the response

**Arguments**:

- **options** `object`
  - **jitter** `number` - Jitter value in miliseconds
  - **max** `number` - Random jitter maximum value
  - **min** `number` - Random jitter minimum value

```js
toxy.poison(toxy.poisons.latency({ jitter: 1000 }))
// Or alternatively using a random value
toxy.poison(toxy.poisons.latency({ max: 1000, min: 100 }))
```

#### Inject response
Name: `inject`

Injects a custom response, intercepting the request before sending it to the target server. Useful to inject errors originated in the server.

**Arguments**:

- **options** `object`
  - **code** `number` - Response HTTP status code
  - **headers** `object` - Optional headers to send
  - **body** `mixed` - Optional body data to send
  - **encoding** `string` - Body encoding. Default to `utf8`

```js
toxy.poison(toxy.poisons.inject({
  code: 503,
  body: '{"error": "toxy injected error"}',
  headers: {'Content-Type': 'application/json'}
}))
```

#### Bandwidth
Name: `bandwidth`

Limits the amount of bytes sent over the network in outgoing HTTP traffic for a specific threshold time frame.

This poison is basically an alias to [throttle](#throttle).

**Arguments**:

- **options** `object`
  - **bps** `number` - Bytes per second. Default to `1024`
  - **threshold** `number` - Limit time frame in miliseconds. Default `1000`

```js
toxy.poison(toxy.poisons.bandwidth({ bps: 512 }))
```

#### Rate limit
Name: `rateLimit`

Limits the amount of requests received by the proxy in a specific threshold time frame. Designed to test API limits. Exposes typical `X-RateLimit-*` headers.

Note that this is very simple rate limit implementation, indeed limits are stored in-memory, therefore are completely volalite.
There're a bunch of featured and consistent rate limiter implementations in [npm](https://www.npmjs.com/search?q=rate+limit) that you can plug in as poison. You might also interested in [token bucket algorithm](http://en.wikipedia.org/wiki/Token_bucket).

**Arguments**:

- **options** `object`
  - **limit** `number` - Total amount of request. Default to `10`
  - **threshold** `number` - Limit threshold time frame in miliseconds. Default to `1000`
  - **message** `string` - Optional error message when limit reached.
  - **code** `number` - HTTP status code when limit reached. Default to `429`.

```js
toxy.poison(toxy.poisons.rateLimit({ limit: 5, threshold: 10 * 1000 }))
```

#### Slow read
Name: `slowRead`

Reads incoming payload data packets slowly. Only valid for non-GET request.

**Arguments**:

- **options** `object`
  - **chunk** `number` - Packet chunk size in bytes. Default to `1024`
  - **threshold** `number` - Limit threshold time frame in miliseconds. Default to `1000`

```js
toxy.poison(toxy.poisons.slowRead({ chunk: 2048, threshold: 1000 }))
```

#### Slow open
Name: `slowOpen`

Delays the HTTP connection ready state.

**Arguments**:

- **options** `object`
  - **delay** `number` - Delay connection in miliseconds. Default to `1000`

```js
toxy.poison(toxy.poisons.slowOpen({ delay: 2000 }))
```

#### Slow close
Name: `slowClose`

Delays the HTTP connection close signal (EOF).

**Arguments**:

- **options** `object`
  - **delay** `number` - Delay time in miliseconds. Default to `1000`

```js
toxy.poison(toxy.poisons.slowClose({ delay: 2000 }))
```

#### Throttle
Name: `throttle`

Restricts the amount of packets sent over the network in a specific threshold time frame.

**Arguments**:

- **options** `object`
  - **chunk** `number` - Packet chunk size in bytes. Default to `1024`
  - **threshold** `object` - Limit threshold time frame in miliseconds. Default to `100`

```js
toxy.poison(toxy.poisons.throttle({ chunk: 2048, threshold: 1000 }))
```

#### Abort connection
Name: `abort`

Aborts the TCP connection. From the low-level perspective, this will destroy the socket on the server, operating only at TCP level without sending any specific HTTP application level data.

**Arguments**:

- **options** `object`
  - **delay** `number` - Socket destroy delay in miliseconds. Default to `0`

```js
toxy.poison(toxy.poisons.abort())
```

#### Timeout
Name: `timeout`

Defines a response timeout. Useful when forward to potentially slow servers.

**Arguments**:

- **miliseconds** `number` - Timeout limit in miliseconds

```js
toxy.poison(toxy.poisons.timeout(5000))
```

### How to write poisons

Poisons are implemented as standalone middleware (like in connect/express).

Here's a simple example of a server latency poison:
```js
var toxy = require('toxy')

function customLatency(delay) {
  /**
   * We name the function since toxy uses it as identifier to get/disable/remove it in the future
   */
  return function customLatency(req, res, next) {
    var timeout = setTimeout(clean, delay)
    req.once('close', onClose)

    function onClose() {
      clearTimeout(timeout)
      next('client connection closed')
    }

    function clean() {
      req.removeListener('close', onClose)
      next()
    }
  }
}

var proxy = toxy()

// Register and enable the poison
proxy
  .get('/foo')
  .poison(customLatency(2000))
```

You can optionally extend the build-in poisons with your own poisons:

```js
toxy.addPoison(customLatency)

// Then you can use it as a built-in poison
proxy
  .get('/foo')
  .poison(toxy.poisons.customLatency)
```

For featured real example, take a look to the [built-in poisons](https://github.com/h2non/toxy/tree/master/lib/poisons) implementation.

## Rules

Rules are simple validation filters which inspect an HTTP request and determine, given a certain rules (e.g: method, headers, query params), if  the HTTP transaction should be poisoned or not.

Rules are useful to compose, decouple and reuse logic among different scenarios of poisoning.
Rules can be applied to the global, route or even poison scope.

Rules are executed in FIFO order. Their evaluation logic is equivalent to `Array#every()` in JavaScript: all the rules must pass in order to proceed with the poisoning.

### Built-in rules

#### Probability

Enables the rule by a random probabilistic. Useful for random poisioning.

**Arguments**:

- **percentage** `number` - Percentage of filtering. Default `50`

```js
var rule = toxy.rules.probability(85)
toxy.rule(rule)
```

#### Method

Filters by HTTP method.

**Arguments**:

- **method** `string|array` - Method or methods to filter.

```js
var method = toxy.rules.method(['GET', 'POST'])
toxy.rule(method)
```

#### Headers

Filter by certain headers.

**Arguments**:

- **headers** `object` - Headers to match by key-value pair. `value` can be a string, regexp, `boolean` or `function(headerValue, headerName) => boolean`

```js
var matchHeaders = {
  'content-type': /^application/\json/i,
  'server': true, // meaning it should be present,
  'accept': function (value, key) {
    return value.indexOf('text') !== -1
  }
}

var rule = toxy.rules.headers(matchHeaders)
toxy.rule(rule)
```

#### Content Type

Filters by content type header. It should be present

**Arguments**:

- **value** `string|regexp` - Header value to match.

```js
var rule = toxy.rules.contentType('application/json')
toxy.rule(rule)
```

#### Body

Match incoming body payload data by string, regexp or custom filter function

**Arguments**:

- **match** `string|regexp|function` - Body content to match
- **limit** `string` - Optional. Body limit in human size. E.g: `5mb`
- **encoding** `string` - Body encoding. Default to `utf8`
- **length** `number` - Body length. Default taken from `Content-Length` header

```js
var rule = toxy.rules.body('"hello":"world"')
toxy.rule(rule)

// Or using a filter function returning a boolean
var rule = toxy.rules.body(function (body) {
  return body.indexOf('hello') !== -1
})
toxy.rule(rule)
```

### How to write rules

Rules are simple middleware functions that resolve asyncronously with a `boolean` value to determine if a given HTTP transaction should be ignored when poisoning.

Your rule must resolve with a `boolean` param calling the `next(err,
shouldIgnore)` function in the middleware, passing a `true` value if the rule has not matches and should not apply the poisioning, and therefore continuing with the next middleware stack.

Here's an example of a simple rule matching the HTTP method to determine if:
```js
var toxy = require('toxy')

function customMethodRule(matchMethod) {
  /**
   * We name the function since it's used by toxy to identify the rule to get/disable/remove it in the future
   */
  return function customMethodRule(req, res, next) {
    var shouldIgnore = req.method !== matchMethod
    next(null, shouldIgnore)
  }
}

var proxy = toxy()

// Register and enable the rule
proxy
  .get('/foo')
  .rule(customMethodRule('GET'))
  .poison(/* ... */)
```

You can optionally extend the build-in rules with your own rules:

```js
toxy.addRule(customMethodRule)

// Then you can use it as a built-in poison
proxy
  .get('/foo')
  .rules(toxy.rules.customMethodRule)
```

For featured real examples, take a look to the built-in rules [implementation](https://github.com/h2non/toxy/tree/master/lib/rules)

## Programmatic API

`toxy` API is completely built on top the [rocky API](https://github.com/h2non/rocky#programmatic-api). In other words, you can use any of the methods, features and middleware layer natively provided by `rocky`.

### toxy([ options ])

Create a new `toxy` proxy.

For supported `options`, please see rocky [documentation](https://github.com/h2non/rocky#configuration)

```js
var toxy = require('toxy')

toxy({ forward: 'http://server.net', timeout: 30000 })

toxy
  .get('/foo')
  .poison(toxy.poisons.latency(1000))
  .withRule(toxy.rules.contentType('json'))
  .forward('http://foo.server')

toxy
  .post('/bar')
  .poison(toxy.poisons.bandwidth({ bps: 1024 }))
  .withRule(toxy.rules.probability(50))
  .forward('http://bar.server')

toxy.all('/*')
```

#### toxy#get(path, [ middleware... ])
Return: `ToxyRoute`

Register a new route for `GET` method.

#### toxy#post(path, [ middleware... ])
Return: `ToxyRoute`

Register a new route for `POST` method.

#### toxy#put(path, [ middleware... ])
Return: `ToxyRoute`

Register a new route for `PUT` method.

#### toxy#patch(path, [ middleware... ])
Return: `ToxyRoute`

#### toxy#delete(path, [ middleware... ])
Return: `ToxyRoute`

Register a new route for `DELETE` method.

#### toxy#head(path, [ middleware... ])
Return: `ToxyRoute`

Register a new route for `HEAD` method.

#### toxy#all(path, [ middleware... ])
Return: `ToxyRoute`

Register a new route for any method.

#### toxy#poisons `=>` Object

Exposes a map with the built-in poisons. Prototype alias to `toxy.poisons`

#### toxy#rules `=>` Object

Exposes a map with the built-in poisons. Prototype alias to `toxy.rules`

#### toxy#forward(url)

Define a URL to forward the incoming traffic received by the proxy.

#### toxy#balance(urls)

Forward to multiple servers balancing among them.

For more information, see the [rocky docs](https://github.com/h2non/rocky#programmatic-api)

#### toxy#replay(url)

Define a new replay server.
You can call this method multiple times to define multiple replay servers.

For more information, see the [rocky docs](https://github.com/h2non/rocky#programmatic-api)

#### toxy#use(middleware)

Plug in a custom middleware.

For more information, see the [rocky docs](https://github.com/h2non/rocky#middleware-layer).

#### toxy#useResponse(middleware)

Plug in a response outgoing traffic middleware.

For more information, see the [rocky docs](https://github.com/h2non/rocky#middleware-layer).

#### toxy#useReplay(middleware)

Plug in a replay traffic middleware.

For more information, see the [rocky docs](https://github.com/h2non/rocky#middleware-layer)

#### toxy#middleware()

Return a standard middleware to use with connect/express.

#### toxy#findRoute(routeIdOrPath, [ method ])

Find a route by ID or path and method.

#### toxy#listen(port)

Starts the built-in HTTP server, listening on a specific TCP port.

#### toxy#close([ callback ])

Closes the HTTP server.

#### toxy#poison(poison)
Alias: `usePoison`

Register a new poison.

#### toxy#rule(rule)
Alias: `useRule`

Register a new rule.

#### toxy#withRule(rule)
Aliases: `poisonRule`, `poisonFilter`

Apply a new rule for the latest registered poison.

#### toxy#enable(poison)

Enable a poison by name identifier

#### toxy#disable(poison)

Disable a poison by name identifier

#### toxy#remove(poison)
Return: `boolean`

Remove poison by name identifier.

#### toxy#isEnabled(poison)
Return: `boolean`

Checks if a poison is enabled by name identifier.

#### toxy#disableAll()
Alias: `disablePoisons`

Disable all the registered poisons.

#### toxy#getPoison(poison)
Return: `Directive|null`

Searchs and retrieves a registered poison in the stack by name identifier.

#### toxy#getPoisons()
Return: `array<Directive>`

Return an array of registered poisons wrapped as `Directive`.

#### toxy#flush()
Alias: `flushPoisons`

Remove all the registered poisons.

#### toxy#enableRule(rule)

Enable a rule by name identifier.

#### toxy#disableRule(rule)

Disable a rule by name identifier.

#### toxy#removeRule(rule)
Return: `boolean`

Remove a rule by name identifier.

#### toxy#disableRules()

Disable all the registered rules.

#### toxy#isRuleEnabled(rule)
Return: `boolean`

Checks if the given rule is enabled by name identifier.

#### toxy#getRule(rule)
Return: `Directive|null`

Searchs and retrieves a registered rule in the stack by name identifier.

#### toxy#getRules()
Return: `array<Directive>`

Returns and array with the registered rules wrapped as `Directive`.

#### toxy#flushRules()

Remove all the rules.

### toxy.addPoison(name, fn)

Extend built-in poisons.

### toxy.addRule(name, fn)

Extend built-in rules.

### toxy.poisons `=>` Object

Exposes a map with the built-in poisons.

### toxy.rules `=>` Object

Exposes a map with the built-in rules.

### toxy.VERSION `=>` String

Current toxy semantic version.

### ToxyRoute

`ToxyRoute` exposes the same interface as `Toxy` global interface, it just adds some route level [additional methods](https://github.com/h2non/rocky#routepath).

Further actions you perform againts the `ToxyRoute` API will only be applicable at route-level (nested). In other words: you already know the API.

This example will probably clarify possible doubts:
```js
var toxy = require('toxy')
var proxy = toxy()

// Now using the global API
proxy
  .forward('http://server.net')
  .poison(toxy.poisons.bandwidth({ bps: 1024 }))
  .rule(toxy.rules.method('GET'))

// Now create a route
var route = proxy
  .get('/foo')
  .toPath('/bar') // Route-level API method
  .host('server.net') // Route-level API method
  .forward('http://new.server.net')

// Now using the ToxyRoute interface
route
  .poison(toxy.poisons.bandwidth({ bps: 512 }))
  .rule(toxy.rules.contentType('json'))
```

### Directive(middlewareFn)

A convenient wrapper internally used for poisons and rules.

Normally you don't need to know this interface, but for hacking purposes or more low-level actions might be useful.

#### Directive#enable()
Return: `boolean`

#### Directive#disable()
Return: `boolean`

#### Directive#isEnabled()
Return: `boolean`

#### Directive#rule(rule)
Alias: `filter`

#### Directive#handler()
Return: `function(req, res, next)`

## HTTP API

The `toxy` HTTP API follows the [JSON API](http://jsonapi.org) conventions, including resource based hypermedia linking.

### Usage

For a featured use case, see the [admin server](examples/admin.js) example.

```js
const toxy = require('toxy')

// Create the toxy admin server
var admin = toxy.admin()
admin.listen(9000)

// Create the toxy proxy
var proxy = toxy()
proxy.listen(3000)

// Add the toxy instance to be managed by the admin server
admin.manage(proxy)

// Then configure the proxy
proxy
  .forward('http://my.target.net')

proxy
  .get('/slow')
  .poison(toxy.poisons.bandwidth({ bps: 1024 }))

// Handle the rest of the traffic
proxy
  .all('/*')
  .poison(toxy.poisons.bandwidth({ bps: 1024 * 5 }))

console.log('toxy proxy listening on port:', 3000)
console.log('toxy admin server listening on port:', 9000)
```

For more details about the admin programmatic API, see [below](#programmatic-api-1).

### Authorization

The HTTP API can be protected to unauthorized clients.
Authorized clients must define the API key token via `API-Key` or `Authorization` HTTP headers.

To enable it, you should simple pass the following options to `toxy` admin server:

```js
const toxy = require('toxy')

const opts = { apiKey: 's3cr3t' }
var admin = toxy.admin(opts)

admin.listen(9000)
console.log('protected toxy admin server listening on port:', 9000)
```

### API

**Hierarchy**:

- **Servers** - Managed `toxy` instances
  - **Rules** - Globally applied rules
  - **Poisons** - Globally applied poisons
    - **Rules** - Poison-specific rules
  - **Routes** - List of configured routes
    - **Route** - Object for each specific route
      - **Rules** - Route-level registered rules
      - **Poisons** - Route-level registered poisons
        - **Rules** - Route-level poison-specific rules

#### GET /

### Servers

#### GET /servers

#### GET /servers/:id

### Rules

#### GET /servers/:id/rules

#### POST /servers/:id/rules
Accepts: `application/json`

Example payload:
```js
{
  "name": "method",
  "options": "GET"
}
```

#### DELETE /servers/:id/rules

#### GET /servers/:id/rules/:id

#### DELETE /servers/:id/rules/:id

### Poisons

#### GET /servers/:id/poison

#### POST /servers/:id/poisons
Accepts: `application/json`

Example payload:
```js
{
  "name": "latency",
  "options": { "jitter": 1000 }
}
```

#### DELETE /servers/:id/poisons

#### GET /servers/:id/poisons/:id

#### DELETE /servers/:id/poisons/:id

#### GET /servers/:id/poisons/:id/rules

#### POST /servers/:id/poisons/:id/rules
Accepts: `application/json`

Example payload:
```js
{
  "name": "method",
  "options": "GET"
}
```

#### DELETE /servers/:id/poisons/:id/rules

#### GET /servers/:id/poisons/:id/rules/:id

#### DELETE /servers/:id/poisons/:id/rules/:id

### Routes

#### GET /servers/:id/routes

#### POST /servers/:id/routes
Accepts: `application/json`

Example payload:
```js
{
  "path": "/foo", // Required
  "method": "GET", // use ALL for all the methods
  "forward": "http://my.server", // Optional custom forward server URL
}
```

#### DELETE /servers/:id/routes

#### GET /servers/:id/routes/:id

#### DELETE /servers/:id/routes/:id

### Route rules

#### GET /servers/:id/routes/:id/rules

#### POST /servers/:id/routes/:id/rules
Accepts: `application/json`

Example payload:
```js
{
  "name": "method",
  "options": "GET"
}
```

#### DELETE /servers/:id/routes/:id/rules

#### GET /servers/:id/routes/:id/rules/:id

#### DELETE /servers/:id/routes/:id/rules/:id

### Route poisons

#### GET /servers/:id/routes/:id/poisons

#### POST /servers/:id/routes/:id/poisons
Accepts: `application/json`

Example payload:
```js
{
  "name": "latency",
  "options": { "jitter": 1000 }
}
```

#### DELETE /servers/:id/routes/:id/poisons

#### GET /servers/:id/routes/:id/poisons/:id

#### DELETE /servers/:id/routes/:id/poisons/:id

#### GET /servers/:id/routes/:id/poisons/:id/rules

#### POST /servers/:id/routes/:id/poisons/:id/rules

Accepts: `application/json`

Example payload:
```js
{
  "name": "method",
  "options": "GET"
}
```

#### DELETE /servers/:id/routes/:id/poisons/:id/rules

#### GET /servers/:id/routes/:id/poisons/:id/rules/:id

#### DELETE /servers/:id/routes/:id/poisons/:id/rules/:id

### Programmatic API

The built-in HTTP admin server also provides a simple interface open to extensibility and hacking purposes.
For instance, you can plug in additional middleware to the admin server, or register new routes.

#### toxy.admin([ opts ])
Returns: `Admin`

**Supported options**:

- **apiKey** - Optional API key to protect the server
- **port** - Optional. TCP port to listen

##### Admin#listen([ port, host ])

Start listening on the network.

##### Admin#manage(toxy)

Manage a `toxy` server instance.

##### Admin#find(toxy)

Find a toxy instance. Accepts toxy server ID or toxy instance.

##### Admin#remove(toxy)

Stop managing a toxy instance.

##### Admin#use(...middleware)

Register a middleware.

##### Admin#param(...middleware)

Register a param middleware.

##### Admin#get(path, [ ...middleware ])

Register a GET route.

##### Admin#post(path, [ ...middleware ])

Register a POST route.

##### Admin#put(path, [ ...middleware ])

Register a PUT route.

##### Admin#delete(path, [ ...middleware ])

Register a DELETE route.

##### Admin#patch(path, [ ...middleware ])

Register a PATCH route.

##### Admin#all(path, [ ...middleware ])

Register a route accepting any HTTP method.

##### Admin#middleware(req, res, next)

Middleware to plug in with connect/express.

##### Admin#close(cb)

Stop the server.

## License

MIT - Tomas Aparicio
