const toxy = require('../..')
const timeout = 30 * 1000

toxy({ timeout: timeout, proxyTimeout: timeout })
  .forward('http://localhost:9001')
  .listen(9000)
  .post('*')
