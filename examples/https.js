var fs = require('fs')
var http = require('http')
var toxy = require('..')

var fixtures = __dirname + '/../test/fixtures'

var opts = {
  ssl: {
    key: fs.readFileSync(fixtures + '/key.pem', 'utf8'),
    cert: fs.readFileSync(fixtures + '/cert.pem', 'utf8')
  }
}

var proxy = toxy(opts)

proxy
  .forward('http://httpbin.org')
  .poison(toxy.poisons.latency(1000))
  .poison(toxy.poisons.slowRead(512))
  .all('/*')

proxy.listen(3443)
console.log('HTTPS server listening on port:', 3443)
