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
  .outgoingPoison(poisons.latency(1000))
  .outgoingPoison(poisons.bandwidth({ bytes: 1024 }))
  .outgoingPoison(function (req, res) {
    res.writeHead(400, { 'Content-Length': 5 })
    res.end('Error')
  })
  .withRule(rules.method('POST'))

proxy.listen(3000)
console.log('Server listening on port:', 3000)
