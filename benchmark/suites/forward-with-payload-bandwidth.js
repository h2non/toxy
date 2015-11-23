const toxy = require('../..')

toxy()
  .forward('http://localhost:9001')
  .listen(9000)
  .all('*')
  .poison(toxy.poisons.bandwidth({ bps: 1024 }))
