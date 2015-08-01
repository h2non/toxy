const common = require('../common')

module.exports = function throttle(opts) {
  opts = opts || {}
  var threshold = +opts.threshold || 100
  var chunkSize = (+opts.chunk || +opts.bps) || 1024

  return function throttle(req, res, next) {
    var buf = []
    var closed = false
    var ended = false

    var resproto = Object.getPrototypeOf(res)
    var _end = resproto.end
    var _write = resproto.write

    // Listen for client connection close
    req.on('close', cleanup)
    res.on('close', cleanup)

    // Wrap native http.OutgoingMessage methods to incept the body chunks
    res.write = function (data, encoding, done) {
      common.sliceBuffer(chunkSize, data, encoding, buf)
      if (done) done()
    }

    res.end = function (data, encoding, done) {
      if (data && typeof data !== 'function') {
        common.sliceBuffer(chunkSize, data, encoding, buf)
      }

      // Party time: finally write each chunk with a delay in FIFO order
      common.eachSeries(buf, writeDefer, end)

      function end() {
        cleanup()
        res.end(done)
      }
    }

    function writeDefer(chunk, next) {
      setTimeout(function () {
        if (closed) return next('closed')
        _write.call(res, chunk.buffer, chunk.encoding, next)
      }, threshold)
    }

    function cleanup() {
      if (closed) return
      closed = true

      // Restore and clean references
      res.end = _end
      res.write = _write
      _end = _write = resproto = buf = null

      // Clean listeners to prevent leaks
      req.removeListener('close', cleanup)
      req.removeListener('close', cleanup)
    }

    next()
  }
}
