const toxy = require('../..')
const timeout = 30 * 1000

toxy({ timeout: timeout, proxyTimeout: timeout })
  .forward('http://httpbin.org')
  .listen(9000)
  .post('*')
  .host('httpbin.org')
  .toPath('/post')
