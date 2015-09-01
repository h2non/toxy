const common = require('../common')

module.exports = function throttle(opts) {
  opts = opts || {}

  var threshold = +opts.threshold || 100
  var chunkSize = +opts.bps || +opts.bytes || +opts.chunk || 1024

  return function throttle(req, res, next) {
    var buf = []
    var closed = false
    var ended = false

    var _end = res.end
    var _write = res.write

    // Listen for connection close in both ends
    req.on('close', cleanup)
    res.on('close', cleanup)

    // Wrap native http.OutgoingMessage methods to incept the body chunks
    res.write = function (data, encoding, done) {
      common.splitBuffer(chunkSize, data, encoding, buf)
      if (done) done()
    }

    res.end = function (data, encoding, done) {
      if (data && typeof data !== 'function') {
        common.splitBuffer(chunkSize, data, encoding, buf)
      }

      // Party time: write each chunk with a delay in FIFO order
      common.eachSeries(buf, writeDefer, end)

      function end() {
        cleanup()
        res.end(done)
      }
    }

    function writeDefer(chunk, next) {
      setTimeout(write, threshold)

      function write() {
        if (closed) return next('closed')
        _write.call(res, chunk.buffer, chunk.encoding, next)
      }
    }

    function cleanup() {
      if (closed) return
      closed = true

      // Restore methods
      res.end = _end
      res.write = _write

      // Clean references and listeners to prevent leaks
      _end = _write = buf = null
      req.removeListener('close', cleanup)
      req.removeListener('close', cleanup)
    }

    next()
  }
}
