const toxy = require('..')

const proxy = toxy()

proxy.percentage(80)
proxy.delay({ max: 1000, min: 100 })
//proxy.throttle(100)

proxy
  .forward('http://httpbin.org')

proxy
  .get('/headers')
  .delay({ jitter: 1500 })

proxy
  .get('/ip')
  .percentage(20)
  .abort()

proxy
  .all('/*')

proxy.listen(8089)
