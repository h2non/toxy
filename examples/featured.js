const toxy = require('..')

const proxy = toxy()
const rules = proxy.rules
const poisons = proxy.poisons

proxy
  .forward('http://httpbin.org')
  .rule(rules.probability(50))
  .poison(poisons.slowOpen({ delay: 500 }))

var route = proxy.get('/*')

route
  .poison(poisons.latency({ jitter: 1000 }))

route
  .poison(poisons.inject({ code: 502, body: 'Error!', headers: { 'X-Toxy-Poison': 'error' } }))
  .withRule(rules.probability(25))

route
  .poison(poisons.slowClose({ delay: 1000 }))
  .withRule(rules.probability(20))

route
  .poison(poisons.rateLimit({ limit: 2, threshold: 5000 }))
  .withRule(rules.probability(20))

route
  .poison(poisons.slowRead({ bps: 100 }))
  .withRule(rules.probability(35))

route
  .poison(poisons.abort())
  .poisonRule(rules.probability(5)) // does the same as withRule()
  .poisonRule(rules.method('GET'))

proxy.listen(3000)
console.log('Server listening on port:', 3000)
