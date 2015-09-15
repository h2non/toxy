const toxy = require('..')

const proxy = toxy()
const rules = proxy.rules
const poisons = proxy.poisons

proxy
  .forward('http://httpbin.org')

proxy
  .get('/')
  .poison(poisons.abort())

proxy
  .all('/delay/*')
  // In this case, the socket will be closed if
  // the target server takes more than
  // 2 seconds to respond
  .poison(poisons.abort({ delay: 2000, next: true }))
  .withRule(rules.method('GET'))

proxy.all('/*')

proxy.listen(3000)
console.log('Server listening on port:', 3000)
console.log('Test abort: http://localhost:3000/delay/1')
console.log('Test do not abort: http://localhost:3000/delay/3')
