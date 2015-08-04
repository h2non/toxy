const toxy = require('..')
const poisons = toxy.poisons
const rules = toxy.rules

const proxy = toxy()

proxy
  .forward('http://httpbin.org')
  .poison(poisons.latency(1000))
  .rule(rules.method('GET'))

proxy
  .get('/ip')
  .forward('http://myip.com')
  .poison(poisons.rateLimit({ limit: 1, threshold: 5000 }))

proxy
  .get('/get')
  .poison(poisons.abort())

proxy
  .get('/image/*')
  .poison(poisons.bandwidth({ bps: 1024 }))

proxy
  .post('/post')
  .forward('http://upload.server')
  .poison(poisons.slowRead({ bps: 1024 }))

proxy
  .all('/*')

proxy.listen(3000)
console.log('Server listening on port:', 3000)
