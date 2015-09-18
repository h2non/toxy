const toxy = require('..')
const poisons = toxy.poisons
const rules = toxy.rules

const proxy = toxy()
const serverhost = 'httpbin.org'
const timeout = 1500

proxy
  .forward('http://' + serverhost)

proxy
  .all('/delay/*')
  // In this case, the socket will be closed if
  // the target server doesn't replies with
  // a response after 2 seconds
  .poison(toxy.poisons.abort({ delay: timeout, next: true }))
  .withRule(rules.method('GET'))

const port = 4567
proxy.listen(port)
console.log('Server listening on port:', port)
console.log('Success: http://localhost:' + port + '/delay/1')
console.log('Aborted: http://localhost:' + port + '/delay/3')
