const toxy = require('..')

const proxy = toxy()
const rules = proxy.rules
const poisons = proxy.poisons

proxy
  .forward('http://httpbin.org')

var route = proxy.get('/*')

// Register global rules for the current route
route
  .poisonRule(rules.method(['GET', 'POST']))
  .poisonRule(rules.headers({ 'content-type': /^application\/json/i }))

// Register poisons
route
  .poison(poisons.latency({ jitter: 1000 }))
  .poison(poisons.slowClose({ delay: 1000 }))
  .poison(poisons.rateLimit({ limit: 2, threshold: 5000 }))

route
  .poison(poisons.inject({ code: 502, body: 'Error!', headers: { 'X-Toxy-Poison': 'error' } }))
  // Apply a rule only for the last poison
  .withRule(rules.probability(25))

route
  .poison(poisons.abort())
  .poisonRule(rules.probability(5)) // does the same as withRule()

proxy.listen(3000)
console.log('Server listening on port:', 3000)
