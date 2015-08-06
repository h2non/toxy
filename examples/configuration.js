const toxy = require('..')

const proxy = toxy()
const rules = proxy.rules
const poisons = proxy.poisons

proxy
  .forward('http://httpbin.org')

proxy
  .poison(poisons.inject({
    code: 503,
    body: '{"error": "toxy injected error"}',
    headers: {'Content-Type': 'application/json'}
  }))
  .withRule(rules.method('GET'))
  .withRule(rules.probability(50))

// Disable poison
proxy.disable('inject')
proxy.isEnabled('inject') // -> false

// Re-enable it
proxy.enable('inject')
proxy.isEnabled('inject') // -> true

// Get registered poisons
proxy.poisons() // -> [ inject ]

// Remove the poison
proxy.remove('inject')
proxy.poisons() // -> []

// Flush all poisons (not necessary, though)
proxy.flush()

// Disable rule
proxy.disableRule('method')
proxy.isRuleEnabled('method') // -> false

// Re-enable it
proxy.enableRule('method')
proxy.isRuleEnabled('method') // -> true

// Get registered rules
proxy.rules() // -> [ method, probability ]

// Remove the rule
proxy.removeRule('method')
proxy.rules() // -> [ probability ]

// Flush all rules (aka remove all)
proxy.flush()

proxy.all('/*')

proxy.listen(3000)
console.log('Server listening on port:', 3000)
