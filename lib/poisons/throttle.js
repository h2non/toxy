const helpers = require('../helpers')

module.exports = function throttle (opts) {
  opts = opts || {}

  const delay = +opts.threshold || +opts.delay || 100
  const chunkSize = +opts.bps || +opts.bytes || +opts.chunk || 1024

  return function throttle (req, res, next) {
    var _end = res.end
    var _write = res.write

    // Cache payload
    var buf = []
    var closed = false

    // Listen for connection close in both ends
    req.once('close', cleanup)
    res.once('close', cleanup)

    // Wrap native http.OutgoingMessage methods to incept the body chunks
    res.write = function (data, encoding, done) {
      helpers.splitBuffer(chunkSize, data, encoding, buf)
      if (done) done()
      return true
    }

    res.end = function (data, encoding, done) {
      if (data && typeof data !== 'function') {
        helpers.splitBuffer(chunkSize, data, encoding, buf)
      }

      // Party time: write each chunk with a delay in FIFO order
      helpers.eachSeries(buf, writeDefer, end)

      function end () {
        cleanup()
        try { res.end(done) } catch (e) {}
      }
    }

    function writeDefer (chunk, next) {
      setTimeout(function write () {
        if (closed) return next('closed')
        _write.call(res, chunk.buffer, chunk.encoding, next)
      }, delay)
    }

    function cleanup () {
      if (closed) return
      closed = true

      // Restore methods
      res.end = _end
      res.write = _write

      // Clean references and listeners to prevent leaks
      _end = _write = buf = null
      req.removeListener('close', cleanup)
      res.removeListener('close', cleanup)
    }

    next()
  }
}
