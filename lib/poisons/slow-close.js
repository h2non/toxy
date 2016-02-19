module.exports = function slowClose (opts) {
  opts = opts || {}
  const delay = +opts || +opts.delay || 1000

  return function slowClose (req, res, next) {
    // Cache native methods
    const proto = Object.getPrototypeOf(res)

    // Store state
    var ended = false

    res.setHeader = function (header, value) {
      if (header.toLowerCase() !== 'content-length') {
        proto.setHeader.call(res, header, value)
      }
    }

    res.writeHead = function (code, headers) {
      if (headers && headers['content-length']) {
        delete headers['content-length']
      }
      proto.writeHead.call(res, code, headers)
    }

    res.end = function () {
      if (ended) return
      ended = true

      var args = arguments
      setTimeout(end, delay)

      function end () {
        // Restore native methods
        res.end = proto.end
        res.writeHead = proto.writeHead
        res.setHeader = proto.setHeader

        // Ends the response
        res.end.apply(res, args)

        // Clean references to prevent leaks
        args = null
      }
    }

    next()
  }
}
