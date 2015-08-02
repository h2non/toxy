const defaultDelay = 5000

module.exports = function slowClose(opts) {
  opts = opts || {}
  var delay = +opts || +opts.delay || defaultDelay

  return function slowClose(req, res, next) {
    var ended = false
    var _end = res.end
    var resproto = Object.getPrototypeOf(res)
    var _setHeader = resproto.setHeader
    var _writeHead = resproto.writeHead

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

        // End response
        res.end.apply(res, args)

        // Clean references to prevent leaks
        _res = _setHeader = null
        _writeHead = args = resproto = null
      }
    }

    next()
  }
}
