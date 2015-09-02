const toxy = require('..')

const proxy = toxy()
const rules = proxy.rules
const poisons = proxy.poisons

proxy
  .forward('http://httpbin.org')

proxy
  .rule(rules.method('GET'))

  .poison(poisons.inject({
    code: 503,
    body: '{"error": "toxy injected error"}',
    headers: {'Content-Type': 'application/json'}
  }))
  .withRule(rules.probability(50))

  .outgoingPoison(poisons.bandwidth({ 
    bytes: 1024
  }))
  .withRule(rules.probability(50))

// Get poison
var poison = proxy.getPoison('inject')
poison.isEnabled() // -> true

// Get outgoing poison
var poison = proxy.getOutgoingPoison('bandwidth')
poison.isEnabled() // -> true

// Get rule in the poison scope (nested)
var rule = poison.getRule('probability') // -> Directive
rule.isEnabled() // -> true
rule.disable()
poison.isRuleEnabled('probability') // -> false

// Disable poison
poison.disable() // Or: proxy.disable('inject')
proxy.isEnabled('inject') // -> false

// Re-enable it
proxy.enable('inject')
proxy.isEnabled('inject') // -> true

// Get registered poisons
proxy.getPoisons() // -> [ inject ]

// Remove the poison
proxy.remove('inject')
proxy.getPoisons() // -> []

// Outgoing poison
proxy.isEnabledOutgoing('bandwidth') // -> true

// Flush all poisons (not necessary, though)
proxy.flush()

// Get rule
var rule = proxy.getRule('method')
rule.isEnabled() // -> true

// Disable rule
poison.disable() // Or: proxy.disableRule('method')
proxy.isRuleEnabled('method') // -> false

// Re-enable it
proxy.enableRule('method')
proxy.isRuleEnabled('method') // -> true

// Get registered rules
proxy.getRules() // -> [ method, probability ]

// Remove the rule
proxy.removeRule('method')
proxy.getRules() // -> [ probability ]

// Flush all rules (aka remove all)
proxy.flush()

proxy.all('/*')

proxy.listen(3000)
console.log('Server listening on port:', 3000)
