module.exports = function slowClose (opts) {
  opts = opts || {}
  const delay = +opts || +opts.delay || 1000

  return function slowClose (req, res, next) {
    // Cache native methods
    const proto = Object.getPrototypeOf(res)
    var _end = proto.end
    var _setHeader = proto.setHeader
    var _writeHead = proto.writeHead

    // Store state
    var ended = false

    res.setHeader = function (header, value) {
      if (header.toLowerCase() !== 'content-length') {
        _setHeader.call(res, header, value)
      }
    }

    res.writeHead = function (code, headers) {
      if (headers && headers['content-length']) {
        delete headers['content-length']
      }
      _writeHead.call(res, code, headers)
    }

    res.end = function () {
      if (ended) return
      ended = true

      var args = arguments
      setTimeout(end, delay)

      function end () {
        // Restore native methods
        res.end = _end
        res.writeHead = _writeHead
        res.setHeaders = _setHeader

        // Ends the response
        res.end.apply(res, args)

        // Clean references to prevent leaks
        _end = _setHeader = null
        _writeHead = args = null
      }
    }

    next()
  }
}
