# toxy [![Build Status](https://api.travis-ci.org/h2non/toxy.svg?branch=master&style=flat)](https://travis-ci.org/h2non/toxy) [![Code Climate](https://codeclimate.com/github/h2non/toxy/badges/gpa.svg)](https://codeclimate.com/github/h2non/toxy) [![NPM](https://img.shields.io/npm/v/toxy.svg)](https://www.npmjs.org/package/toxy) ![Stability](http://img.shields.io/badge/stability-beta-orange.svg?style=flat)

<img align="right" height="180" src="http://s8.postimg.org/ikc9jxllh/toxic.jpg" />

**toxy** is a hackable HTTP proxy to simulate server failure scenarios and unexpected conditions. It was mainly designed to be useful for fuzz/evil testing purposes in fault tolerant and resilient systems.
A common use case scenario will be in a service-oriented distributed architecture, acting as intermediate proxy between services.

Runs in [node.js](http://nodejs.org)/[io.js](https://iojs.org). `toxy` is compatible with [connect](https://github.com/senchalabs/connect)/[express](http://expressjs.com), and it was built on top of [rocky](https://github.com/h2non/rocky), a full-featured and middleware-oriented HTTP/S proxy.

Requires node.js +0.12 or io.js +1.6

**This is a work in progress**

## Contents

- [Features](#features)
- Introduction
  - How it works
  - Concepts
  - Middleware layer
- Usage
  - Installation
  - Configuration
  - Examples
- Poisons
  - Built-in poisons
  - How to write poisons
- Rules
  - Built-in rules
  - How to write rules
- Programmatic API
- [License](#license)

## Features

- Full-featured HTTP/S proxy (backed by [http-proxy](https://github.com/nodejistu/node-http-proxy))
- Hackable and featured programmatic API
- Easily augmentable via middleware (based on connect/express middleware)
- Compatible with connect/express
- Built-in
- Pluggable poisons
-
- Runs as standalone HTTP proxy

## Introduction

### Motivation

### Concepts

### How it works

### Middleware layer


## Usage

### Installation

```
npm install toxy
```

### Configuration

### Examples

See [examples/](https://github.com/h2non/toxy/blob/examples) directory for more featured examples

```js
var toxy = require('toxy')

var proxy = toxy()
var poisons = proxy.poisons
var rules = proxy.rules

proxy
  .poison(poisons.delay({ jitter: 500 }))
  .rule(rules.random(50))
  .rule(rules.method('GET'))
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

## Rules

### Built-in rules

- [x] [Random](#random)
- [x] [Method](#method)
- [x] [Headers](#headers)
- [x] [Content Type](#content-type)
- [ ] [Body](#body)

## Poisons

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

#### Random

#### Method

#### Headers

#### Content Type

#### Query params

#### Body

## Programmatic API

### rocky([ options ])

#### Options

## License

MIT - Tomas Aparicio
