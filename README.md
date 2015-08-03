# toxy [![Build Status](https://api.travis-ci.org/h2non/toxy.svg?branch=master&style=flat)](https://travis-ci.org/h2non/toxy) [![Code Climate](https://codeclimate.com/github/h2non/toxy/badges/gpa.svg)](https://codeclimate.com/github/h2non/toxy) [![NPM](https://img.shields.io/npm/v/toxy.svg)](https://www.npmjs.org/package/toxy) ![Stability](http://img.shields.io/badge/stability-beta-orange.svg?style=flat)

<img align="right" height="180" src="http://s8.postimg.org/ikc9jxllh/toxic.jpg" />

**toxy** is a **hackable HTTP proxy** to **simulate** server **failure scenarios** and **unexpected conditions**.

It was designed to be used for fuzz/evil testing, mainly in fault tolerant and resilient systems, such in a service-oriented distributed architecture, where `toxy` acts as intermediate proxy between services.

Runs in [node.js](http://nodejs.org)/[io.js](https://iojs.org). Compatible with [connect](https://github.com/senchalabs/connect)/[express](http://expressjs.com).
Built on top of [rocky](https://github.com/h2non/rocky), a full-featured, middleware-oriented HTTP/S proxy.

Requires node.js +0.12 or io.js +1.6

**This is a work in progress**

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
  - [Built-in poisons](#build-in-poisons)
  - [How to write poisons](#how-to-write-poisons)
- [Rules](#rules)
  - [Built-in rules](#built-in-rules)
  - [How to write rules](#how-to-write-rules)
- [Programmatic API](#programmatic-api)
- [License](#license)

## Features

- Full-featured HTTP/S proxy (backed by [http-proxy](https://github.com/nodejistu/node-http-proxy))
- Hackable and elegant programmatic API (inspired on connect/express)
- Featured built-in router with nested configuration
- Hierarchical middleware layer (global and route-specific)
- Easily augmentable via middleware (based on connect/express middleware)
- Built-in poisons (bandwidth, error, abort, latency, slow read...)
- Rule-based poisoning (probabilistic, HTTP method, headers, body...)
- Support third-party poisons and rules
- Built-in balancer and traffic intercept via middleware
- Inherits the API and features from [rocky](https://github.com/h2non/rocky)
- Compatible with connect/express (and most of their middleware)
- Runs as standalone HTTP proxy

## Introduction

### Why toxy?

There're some other solutions similar to `toxy` in the market, but most of them doesn't provide a proper programmatic control and are not easy to hack, configure and/or extend.

`toxy` provides a powerful hacking-driven solution with a low-level interface and programmatic control with an elegant API and the power, simplicity and fun of node.js.

### Concepts

`toxy` introduces two main core directives you worth to know before use it:

**Poisons** are a specific logic encapsulated as a simple middleware to empoison an incoming or outgoing HTTP flow (e.g: injecting a latency in the server response). HTTP flow can be empoison by one or multiple poisons.

**Rules** are a kind of validation filters which can be applied into the whole HTTP flow or into a concrete poison, in order to determine if one or multiple poisons should be enabled or not to empoison the HTTP traffic (e.g: a probabilistic calculus).

### How it works

```
↓   ( Incoming request )  ↓
↓           |||           ↓
↓     ----------------    ↓
↓     |  Toxy Router |    ↓ --> Match a route based on the incoming request
↓     ----------------    ↓
↓           |||           ↓
↓     ----------------    ↓
↓     |  Exec Rules  |    ↓ --> Apply configured rules for the request
↓     ----------------    ↓
↓          |||            ↓
↓     ----------------    ↓
↓     | Exec Poisons |    ↓ --> If all rules passed, empoison the HTTP transaction
↓     ----------------    ↓
↓        /       \        ↓
↓        \       /        ↓
↓   -------------------   ↓
↓   | HTTP dispatcher |   ↓ --> Proxy the HTTP traffic for both poisoned or not
↓   -------------------   ↓
```

## Usage

### Installation

```
npm install toxy
```

### Examples

See the [examples](https://github.com/h2non/toxy/blob/examples) directory for more use cases

```js
var toxy = require('toxy')
var poisons = toxy.poisons
var rules = toxy.rules

var proxy = toxy()

proxy
  .forward('http://httpbin.org')

proxy
  .poison(poisons.latency({ jitter: 500 }))
  .rule(rules.random(50))
  .poison(poisons.bandwidth({ bps: 1024 }))
  .withRule(rules.method('GET'))

proxy.get('/*')
proxy.listen(3000)
```

## Poisons

Poisons are any specific (evil) logic which acts intercepts and usually mutate, wraps, modify and/or cancel an HTTP transaction in the proxy server.
Poisons can be applied to incoming or outgoing, or even both traffic flows.

Poisons can be composed and reused for different HTTP scenarios.
Poisions are executed in FIFO order.

### Built-in poisons

- [x] [Latency](#latency)
- [x] [Inject response](#inject-response)
- [x] [Bandwidth](#bandwidth)
- [x] [Rate limit](#rate-limit)
- [x] [Slow read](#slow-read)
- [x] [Slow open](#slow-open)
- [x] [Slow close](#slow-close)
- [x] [Throttle](#throttle)
- [x] [Abort connection](#abort-connection)
- [x] [Timeout](#timeout)

#### Latency
Name: `latency`

Inject response latency

#### Inject response
Name: `inject`

Inject a custom response, intercepting the request before sending it to the target server. Useful to test server originated errors.

#### Bandwidth
Name: `bandwidth`

Limit the amount of bytes sent over the network in a specific threshold time frame.

#### Rate limit
Name: `rateLimit`

Rate the amount the requests recieved by the proxy in a specific threshold time frame. Designed to test API limits.

#### Slow read
Name: `slowRead`

Read incoming packets slowly.

#### Slow open
Name: `slowOpen`

Delay the HTTP connection opened status.

#### Slow close
Name: `slowClose`

Delay the EOF signal.

#### Throttle
Name: `throttle`

Restrict the amount of packets sent over the network in a specific threshold time frame.

#### Abort connection
Name: `abort`

Abort the TCP connection, optionally with a custom error. From the low-level perspective, this will destroy the socket on the server, operating only at TCP level without sending any specific HTTP application level data.

#### Timeout
Name: `timeout`

Define a response timeout. Useful when forwarding to potentially slow servers.

### How to write poisons

Poisons are implemented as standalone middleware (like in connect/express).

Here's a simple example of a server latency poison:
```js
function latency(delay) {
  /**
   * We name the function since toxy uses it as identifier to get/disable/remove it in the future
   */
  return function latency(req, res, next) {
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

// Register and enable the poison
toxy
  .get('/foo')
  .poison(latency(2000))
```

For real example, take a look to the [built-in poisons](https://github.com/h2non/toxy/tree/master/lib/poisons) implementation.

## Rules

Rules are simple validation filters which inspects an HTTP request and determines, given a certain rules (e.g: method, headers, query params), if it the HTTP transaction should be poisoned or not, then applying the configured poisons in the current HTTP flow.

Rules are useful as a short of composition to decouple and reuse logic between different scenarios of poisoning. You can also define globally applied rules or nested poison-scope rules only.

Rules are executed in FIFO order. Their evaluation logic is analog to `Array#every()` in JavaScript: all the rules must match in order to proceed with the poisoning.

### Built-in rules

- [x] [Probability](#Probability)
- [x] [Method](#method)
- [x] [Headers](#headers)
- [x] [Content Type](#content-type)
- [ ] [Body](#body)

#### Probability

Enable the rule by a random probabilistic. Useful for random poisioning.

**Arguments**:

- **percentage** `number` - Percentage of filtering. Default `50`

```js
var rule = toxy.rules.probability(85)
toxy.rule(rule)
```

#### Method

Filter by HTTP method.

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

Filter by content type header. It should be present

**Arguments**:

- **value** `string|regexp` - Header value to match.

```js
var rule = toxy.rules.contentType('application/json')
toxy.rule(rule)
```

#### Body

`To do`

### How to write rules

Rules are simple middleware functions that resolves asyncronously with a `boolean` value to determine if a given HTTP transaction should be ignored when poisoning.

Here's a example a simple rule matching the HTTP method to determine if:
```js
function method(matchMethod) {
  /**
   * We name the function since it's used by toxy to identify the rule to get/disable/remove it in the future
   */
  return function method(req, res, next) {
    var shouldIgnore = req.method !== matchMethod
    next(shouldIgnore)
  }
}

// Register and enable the rule
toxy
  .get('/foo')
  .rule(method('GET'))
  .poison(/* ... */)
```

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

#### toxy#post(path, [ middleware... ])
Return: `ToxyRoute`

#### toxy#put(path, [ middleware... ])
Return: `ToxyRoute`

#### toxy#patch(path, [ middleware... ])
Return: `ToxyRoute`

#### toxy#delete(path, [ middleware... ])
Return: `ToxyRoute`

#### toxy#head(path, [ middleware... ])
Return: `ToxyRoute`

#### toxy#all(path, [ middleware... ])
Return: `ToxyRoute`

#### toxy#forward(url)

#### toxy#balance(urls)

#### toxy#replay(url)

#### toxy#use(middleware)

#### toxy#useResponse(middleware)

#### toxy#useReplay(middleware)

#### toxy#poison(poison)
Alias: `usePoison`

#### toxy#rule(rule)
Alias: `useRule`

#### toxy#withRule(rule)
Aliases: `poisonRule`, `poisonFilter`

#### toxy#enable(poison)

#### toxy#disable(poison)

#### toxy#remove(poison)
Return: `boolean`

#### toxy#isEnabled(poison)
Return: `boolean`

#### toxy#disableAll()
Alias: `disablePoisons`

#### toxy#poisons()
Return: `array<Directive>` Alias: `getPoisons`

#### toxy#flush()
Alias: `flushPoisons`

#### toxy#enableRule(rule)

#### toxy#disableRule(rule)

#### toxy#removeRule(rule)
Return: `boolean`

#### toxy#disableRules()

#### toxy#isRuleEnabled(rule)
Return: `boolean`

#### toxy#rules()
Return: `array<Directive>` Alias: `getRules`

#### toxy#flushRules()

### ToxyRoute

Toxy route has, indeed, the same interface as `Toxy` global interface, but further actions you perform againts the API will be only applicable at route-level. In other words: good news, you already know the API.

This example probably will clarify possible doubts:
```js
var toxy = require('toxy')
var proxy = toxy()

// Now using the global API
proxy
  .poison(toxy.poisons.bandwidth({ bps: 1024 }))
  .rule(toxy.rules.method('GET'))

// Now create a route
var route = proxy.get('/foo')

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

## License

MIT - Tomas Aparicio
