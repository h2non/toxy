const toxy = require('..')
const poisons = toxy.poisons
const rules = toxy.rules

const proxy = toxy()

// Configure the proxy
proxy
  .forward('http://httpbin.org')

proxy
  .rule(rules.probability(50))
  .poison(poisons.latency(500))
  .withRule(rules.probability(25))
  .poison(poisons.slowClose(500))
  .withRule(rules.method('GET'))

proxy
  .get('/ip')
  .rule(rules.probability(10))
  .poison(poisons.slowClose())
  .withRule(rules.method('GET'))

proxy
  .get('/image/*')
  .outgoingPoison(poisons.bandwidth(1024))

proxy
  .all('/*')
  .poison(poisons.latency(1000))
  .withRule(rules.probability(50))

proxy.listen(3000)
console.log('Server listening on port:', 3000)

// Enable the admin HTTP server
var admin = toxy.admin(/* { apiKey: 's3cr3t' } */)

// Add the toxy proxy instance
admin.manage(proxy)

admin.listen(9000)
console.log('Admin server listening on port:', 9000)
