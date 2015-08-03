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
- Hackable and featured programmatic API
- Easily augmentable via middleware (based on connect/express middleware)
- Built-in poisons (bandwidth, error, abort, latency, slow read...)
- Rule based poisoning enable/disable (probabilistic, based HTTP method, headers...)
- Support custom third-party poisons and rules
- Built-in balancer and traffic intercept
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
↓    ( Incoming request )   ↓
↓            |||            ↓
↓      ----------------     ↓
↓      |  Toxy Router |     ↓ --> Match a route based on the incoming request
↓      ----------------     ↓
↓            |||            ↓
↓      ----------------     ↓
↓      |  Exec Rules  |     ↓ --> Apply configured rules for the request
↓      ----------------     ↓
↓            |||            ↓
↓      ----------------     ↓
↓      | Exec Poisons |     ↓ --> If rules passed, empoison the HTTP flow
↓      ----------------     ↓
↓         /       \         ↓
↓         \       /         ↓
↓    -------------------    ↓
↓    | HTTP dispatcher |    ↓ --> Proxy the HTTP traffic (poisoned or not)
↓    -------------------    ↓
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
  .poison(poisons.bandwidth({ bps: 1024 }))
  .rule(rules.random(50))
  .rule(rules.method('GET'))

proxy.get('/*')
proxy.listen(3000)
```

## Poisons

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

#### Inject response

#### Bandwidth

#### Rate limit

#### Slow read

#### Slow open

#### Slow close

#### Throttle

#### Abort connection

#### Timeout

## Rules

### Built-in rules

- [x] [Random](#random)
- [x] [Method](#method)
- [x] [Headers](#headers)
- [x] [Content Type](#content-type)
- [ ] [Body](#body)

#### Random

#### Method

#### Headers

#### Content Type

#### Query params

#### Body

`To do`

## Programmatic API

`toxy` API is completely built on top the [rocky API](https://github.com/h2non/rocky#programmatic-api). That means you can use any of the methods and middleware provided by rocky.

### toxy([ options ])

Create a new `toxy` proxy.
For supported options, see rocky [documentation](https://github.com/h2non/rocky#configuration)

#### toxy

## License

MIT - Tomas Aparicio
