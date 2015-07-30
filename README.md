# toxy

Hackable HTTP proxy to simulate system failure conditions.
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

## Design tasks

- [ ] Poison interface
- [ ] Hierachical poison filtering
- [ ] Filter rules (percentage, verb, body)
- [ ] Hierarchical filter rules

## License

MIT - Tomas Aparicio
