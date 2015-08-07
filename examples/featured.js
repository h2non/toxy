ar toxy = require('toxy')
var poisons = toxy.poisons
var rules = toxy.rules

var proxy = toxy()

proxy
  .forward('http://httpbin.org')

// Register global poisons and rules
proxy
  .poison(poisons.latency({ jitter: 500 }))
  .rule(rules.probability(25))

// Register multiple routes
proxy
  .get('/download/*')
  .poison(poisons.bandwidth({ bps: 1024 }))
  .withRule(rules.headers({'Authorization': /^Bearer (.*)$/i }))

proxy
  .all('/api/*')
  .poison(poisons.rateLimit({ limit: 10, threshold: 1000 }))
  .withRule(rules.method(['POST', 'PUT', 'DELETE']))

// Handle the rest of the traffic
proxy
  .all('/*')
  .poison(poisons.slowClose({ delay: 1000 }))
  .poison(poisons.slowRead({ bps: 128 }))
  .withRule(rules.probability(50))

proxy.listen(3000)
console.log('Server listening on port:', 3000)
console.log('To test it, open: http://localhost:3000/image/jpeg')
