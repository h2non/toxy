const toxy = require('..')

const proxy = toxy()
const poisons = proxy.poisons
const rules = proxy.rules

proxy
  .forward('http://httpbin.org')
  .poison(poisons.bandwidth({ bps: 2048 }))

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

route
  .poison(poisons.slowClose({ delay: 5000 }))

route.flushAll()

route
  .poison(poisons.throttle({ chunk: 10, window: 500 }))

route
  .poison(poisons.rateLimit({ limit: 2, window: 10000 }))

proxy
  .all('/*')

proxy.listen(8089)
