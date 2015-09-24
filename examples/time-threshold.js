const toxy = require('..')

const proxy = toxy()
const rules = proxy.rules
const poisons = proxy.poisons

proxy
  .forward('http://httpbin.org')

proxy
  .routeAll()

proxy
  .poison(poisons.abort())
  // Enable abort poison during 1 second every 5 seconds
  .withRule(rules.timeThreshold({ duration: 2000, threshold: 1000 * 5 }))
  .withRule(rules.method('GET'))

proxy.all('/*')

proxy.listen(3000)
console.log('Server listening on port:', 3000)
console.log('Test URL: http://localhost:3000')
