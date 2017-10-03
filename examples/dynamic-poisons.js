const toxy = require('..')

const proxy = toxy()
const rules = proxy.rules
const poisons = proxy.poisons

const createPoison = () => poisons.throttle({ chunk: 1024, threshold: 10 })

// Configure proxy
proxy
  .forward('http://httpbin.org')
  .poison(createPoison())
  .withRule(rules.method('GET'))
  .withRule(rules.probability(90))

// Redefine poison every
setInterval(() => {
  console.log('Replacing poison...')
  // Remove by name
  proxy.remove('throttle')
  // Or alternatively remove all poisons
  proxy.flushPoisons()
  // Re-register poison with custom rules
  toxy.poison(createPoison())
    .withRule(rules.method('GET'))
    .withRule(rules.probability(90))
}, 1000)

proxy.all('/*')

proxy.listen(3000)
console.log('Server listening on port:', 3000)
