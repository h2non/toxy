# toxy

Pluggable HTTP proxy to simulate system failure conditions.
Built for [node.js](http://nodejs.org)/[io.js](https://iojs.org). Powered by [rocky](https://github.com/h2non/rocky)

**Don't use it, this is a work in progress**

## Built-in poisons

- [x] Delay
- [ ] Server error
- [ ] Close socket
- [ ] Bandwidth (throttle)
- [ ] Congestion (slow, flaky)
- [ ] Corrupt data
- [ ] Rate limit (debounce)
- [ ] Slow close
- [ ] Slicer

## Built-in filters

- [ ] Probability
- [ ] Headers

## Design tasks

- [ ] Poison interface
- [ ] Hierachical poison filtering
- [ ] Filter rules (percentage, verb, body)
- [ ] Hierarchical filter rules

## Poison interface

```js
var proxy = toxy()
var poisons = proxy.poisons
var rules = proxy.rules

proxy
  .poison(poisons.delay({ jitter: 500 }))
  .rule(rules.probability(50))
  .rule(rules.method('GET'))
```

## License

MIT - Tomas Aparicio
