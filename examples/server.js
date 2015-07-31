const toxy = require('..')

const proxy = toxy()
const poisons = proxy.poisons
const rules = proxy.rules

//proxy.probability(80)
//proxy.delay({ max: 1000, min: 100 })
//proxy.throttle(100)

proxy
  .forward('http://httpbin.org')

proxy
  .get('/headers')

var route = proxy.get('/ip')

route
  .rule(rules.probability(90))
  .poison(poisons.delay({ jitter: 1500 }))

route
  .poison(poisons.abort())
  .poisonRule(rules.probability(50))
  .poison(poisons.error({ code: 502, headers: { 'X-Toxy-Poison': 'error' } }))
  .poisonRule(rules.probability(50))

proxy
  .all('/*')

proxy.listen(8089)
