const toxify = require('..')

const proxy = toxify()

proxy.percentage(80)
proxy.delay({ max: 1000, min: 100 })
proxy.throttle(100)

proxy
  .forward('http://httpbin.org')
  .all('/*')

proxy.listen(8089)
