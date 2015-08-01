const toxy = require('..')

const proxy = toxy({ xfwd: true })
const rules = proxy.rules
const poisons = proxy.poisons

proxy
  //.forward('http://httpbin.org')
  .forward('http://localhost:8080')
  .poison(poisons.abort())
  .poison(poisons.bandwidth({ bps: 1024 * 5 }))
  .poison(poisons.slowOpen({ delay: 5000 }))
  .poisonRule(rules.random(50))
  .poisonRule(rules.matchHeaders({ 'Origin': 'localhost' }))
  //.poisonRule(rules.method('POST'))
  //.poison(poisons.slowRead({ bps: 1024 * 2, threshold: 250 }))

proxy
  .get('/headers')

var route = proxy.get('/ip')

route
  .rule(rules.random(90))
  .poison(poisons.delay({ jitter: 1000 }))

route
  .poison(poisons.abort())
  .poisonRule(rules.random(100))

route
  .poison(poisons.inject({ code: 502, headers: { 'X-Toxy-Poison': 'error' } }))
  .poisonRule(rules.random(50))

route
  .poison(poisons.slowClose({ delay: 5000 }))

route
  .poison(poisons.throttle({ chunk: 10, threshold: 500 }))

route.flushAll()

route
  .poison(poisons.rateLimit({ limit: 2, threshold: 10000 }))

route
  .poison(poisons.slowRead({ bps: 100 }))

proxy
  .all('/*')

proxy.listen(8089)
