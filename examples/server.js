const toxy = require('..')

const proxy = toxy()
const poisons = proxy.poisons
const rules = proxy.rules

proxy
  .forward('http://httpbin.org')
  .poison(poisons.bandwidth({ bps: 500 }))

proxy
  .get('/headers')

var route = proxy.get('/ip')

route
  .rule(rules.probability(90))
  .poison(poisons.delay({ jitter: 1000 }))

route
  .poison(poisons.abort())
  .poisonRule(rules.probability(100))

route
  .poison(poisons.inject({ code: 502, headers: { 'X-Toxy-Poison': 'error' } }))
  .poisonRule(rules.probability(50))

route.flushAll()

route
  .poison(poisons.throttle({ chunk: 10, window: 500 }))

setTimeout(function () {
  route.flushAll()

  route
    .poison(poisons.slowClose({ delay: 5000 }))

  //route.disable('abort')
}, 1000000)

proxy
  .all('/*')

proxy.listen(8089)
