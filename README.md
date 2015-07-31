# toxy

<img align="right" height="200" src="http://s8.postimg.org/ikc9jxllh/toxic.jpg" />

Pluggable and hackable HTTP proxy to simulate multiple server failures and unexpected conditions.
Built for [node.js](http://nodejs.org)/[io.js](https://iojs.org).

Powered by [rocky](https://github.com/h2non/rocky)

**Don't use it. This is a work in progress**

## Built-in poisons

- [x] Delay
- [x] Server error
- [x] Abort connection
- [x] Bandwidth (throttle)
- [ ] Congestion (slow, flaky)
- [ ] Corrupt data
- [ ] Rate limit (debounce)
- [x] Slow close
- [x] Slicer

## Built-in rules

- [x] Probability
- [ ] Headers

## How does it work?

```

```

## Installation

```
npm install toxy
```

## Examples

```js
var proxy = toxy()
var poisons = proxy.poisons
var rules = proxy.rules

proxy
  .poison(poisons.delay({ jitter: 500 }))
  .rule(rules.probability(50))
  .rule(rules.method('GET'))
```

## Poisons

### Delay

### Inject error

### Abort connection

### Bandwidth

## Rules


## License

MIT - Tomas Aparicio
