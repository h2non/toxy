const helpers = require('../helpers')

module.exports = function slowRead (opts) {
  opts = opts || {}

  var threshold = +opts.threshold || 1000
  var chunkSize = +opts.chunk || +opts.bps || 1024

  return function slowRead (req, res, next) {
    var buf = []
    var ended = false
    var closed = false
    var _push = Object.getPrototypeOf(req).push

    if (isInvalidMethod(req)) return next()

    // Handle client close connection properly
    req.once('close', cleanup)
    res.once('close', cleanup)

    // Wrap native http.IncomingMessage method
    req.push = function (data, encoding, done) {
      if (data === null) return writeChunks()
      helpers.splitBuffer(chunkSize, data, encoding, buf)
      return true
    }

    function writeChunks () {
      if (ended) return false
      ended = true
      helpers.eachSeries(buf, pushDefer, end)
      return false
    }

    function end () {
      if (closed) return
      cleanup()
      req.push(null)
    }

    function pushDefer (chunk, next) {
      setTimeout(push, threshold)

      function push () {
        if (closed) return next('closed')
        _push.call(req, chunk.buffer, chunk.encoding)
        next()
      }
    }

    function cleanup () {
      if (closed) return
      closed = true

      // Restore and clean references
      req.push = _push
      _push = buf = null

      // Clean listeners to prevent leaks
      req.removeListener('close', cleanup)
      res.removeListener('close', cleanup)
    }

    next()
  }
}

function isInvalidMethod (req) {
  return !~['POST', 'PUT', 'DELETE', 'PATCH'].indexOf(req.method)
}
