const toxy = require('..')

const proxy = toxy()
const rules = proxy.rules
const poisons = proxy.poisons

proxy
  .forward('http://httpbin.org')
  .rule(rules.probability(50))

// Global, incoming only traffic poisioning
proxy
  .poison(poisons.slowOpen({ delay: 500 }))
  .withRule(rules.method('GET'))

// Route level, incoming and outgoing traffic poisioning
proxy
  .get('/*')
  .poison(poisons.slowOpen({ delay: 500 }))
  .withRule(rules.method('GET'))

  // Define a outgoing traffic poisons
  .outgoingPoison(poisons.bandwidth({ bytes: 1024 }))
  .withRule(rules.method('GET'))

  .outgoingPoison(function (req, res) {
    res.writeHead(400, { 'Content-Length': 5 })
    res.end('Error')
  })
  .withRule(rules.probability(75))
  .withRule(function (req, res, next) {
    // This rule evaluates the server response headers
    // in order to determine if the poison should be applied or not
    if (res.getHeader('server') === 'nginx') {
      return next(null, false)
    }
    next()
  })

proxy.listen(3000)
console.log('Server listening on port:', 3000)
