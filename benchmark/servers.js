const http = require('http')

http.createServer(function (req, res) {
  res.end('Hello world!')
}).listen(9001)

http.createServer(function (req, res) {
  req.on('end', function () {
    res.end('Hello world!')
  })
}).listen(9002)

http.createServer(function (req, res) {
  req.on('end', function () {
    res.end('Hello world!')
  })
}).listen(9003)
