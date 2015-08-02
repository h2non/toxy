const toxy = require('..')
const poisons = toxy.poisons

const proxy = toxy()

proxy
  .balance(['http://httpbin.org', 'http://httpbin.org'])

proxy
  .all('/*')
  .poison(poisons.latency(1000))

proxy.listen(3000)
console.log('Server listening on port:', 3000)
