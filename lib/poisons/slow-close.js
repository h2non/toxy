module.exports = function slowClose(opts) {
  opts = opts || {}
  var delay = +opts || +opts.delay || 1000

  return function slowClose(req, res, next) {
    var ended = false

    // Cache native methods
    var _end = res.end
    var _setHeader = res.setHeader
    var _writeHead = res.writeHead

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

      function end() {
        // Restore native methods
        res.end = _end
        res.writeHead = _writeHead
        res.setHeaders = _setHeader

        // Ends the response
        res.end.apply(res, args)

        // Clean references to prevent leaks
        _res = _setHeader = null
        _writeHead = args = null
      }
    }

    next()
  }
}
