const defaultDelay = 5000

module.exports = function slowClose(opts) {
  opts = opts || {}
  var delay = +opts || +opts.delay || defaultDelay

  return function slowClose(req, res, next) {
    var ended = false
    var _end = res.end
    var _setHeader = res.setHeader

    res.setHeader = function (header, value) {
      if (header.toLowerCase() === 'content-length') {
        return
      }
      _setHeader.call(res, header, value)
    }

    res.end = function () {
      if (ended) return
      ended = true

      var args = arguments
      setTimeout(end, delay)

      function end() {
        res.end = _end
        res.setHeaders = _setHeader
        res.end.apply(res, args)
        _res = _setHeader = args = null
      }
    }

    next()
  }
}
