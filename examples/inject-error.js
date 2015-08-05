const toxy = require('..')

const proxy = toxy()
const rules = proxy.rules
const poisons = proxy.poisons

proxy
  .forward('http://httpbin.org')
  .poison(poisons.inject({
    code: 503,
    body: '{"error": "toxy injected error"}',
    headers: {'Content-Type': 'application/json'}
  }))
  .withRule(rules.method('GET'))
  .withRule(rules.probability(90))

proxy.all('/*')

proxy.listen(3000)
console.log('Server listening on port:', 3000)
