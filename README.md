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

- [x] Delay
- [x] Timeout
- [x] Inject error
- [x] Bandwidth
- [x] Rate limit
- [x] Slow read
- [x] Slow open
- [x] Slow close
- [x] Throttle
- [x] Abort connection

## Built-in rules

- [x] Probability
- [x] Match method
- [x] Match headers
- [x] Content Type
- [ ] Query params
- [ ] Body

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

### Delay

### Inject error

### Abort connection

### Bandwidth

## Rules

### `probability`

### `method`

### `headers`

### `contentType`

### `query`

### `body`

## License

MIT - Tomas Aparicio
