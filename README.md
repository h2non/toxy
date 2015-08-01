# toxy [![Build Status](https://api.travis-ci.org/h2non/toxy.svg?branch=master&style=flat)](https://travis-ci.org/h2non/toxy) [![Code Climate](https://codeclimate.com/github/h2non/toxy/badges/gpa.svg)](https://codeclimate.com/github/h2non/toxy) [![NPM](https://img.shields.io/npm/v/toxy.svg)](https://www.npmjs.org/package/toxy)

<!--
![Downloads](https://img.shields.io/npm/dm/toxy.svg)
-->

<img align="right" height="180" src="http://s8.postimg.org/ikc9jxllh/toxic.jpg" />

Pluggable and hackable HTTP proxy to simulate multiple server failures and unexpected conditions.
Built for [node.js](http://nodejs.org)/[io.js](https://iojs.org). Powered by [rocky](https://github.com/h2non/rocky)

Requires node.js +0.12 or io.js +1.6

**This is a work in progress**

## Built-in poisons

- [x] [Delay](#delay)
- [x] [Timeout](#timeout)
- [x] [Inject response](#inject-response)
- [x] [Bandwidth](#bandwidth)
- [x] [Rate limit](#rate-limit)
- [x] [Slow read](#slow-read)
- [x] [Slow open](#slow-open)
- [x] [Slow close](#slow-close)
- [x] [Throttle](#throttle)
- [x] [Abort connection](#abort-connection)

## Built-in rules

- [x] [Random](#random)
- [x] [Method](#method)
- [x] [Headers](#headers)
- [x] [Content Type](#content-type)
- [ ] [Query params](#query-params)
- [ ] [Body](#body)

<!--
## How it works

```

```
-->

## Installation

```
npm install toxy
```

## Examples

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

#### Delay

#### Timeout

#### Inject response

#### Bandwidth

#### Rate limit

#### Slow read

#### Slow open

#### Slow close

#### Throttle

#### Abort connection

## Rules

#### Random

#### Method

#### Headers

#### Content Type

#### Query params

#### Body

## License

MIT - Tomas Aparicio
