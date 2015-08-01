module.exports = function throttle(opts) {
  opts = opts || {}
  const chunkSize = +opts.chunk || 1024
  const windowSize = +opts.window || 100

  return function throttle(req, res, next) {
    var buf = []
    var closed = false
    var ended = false

    var resProto = Object.getPrototypeOf(res)
    var _end = resProto.end
    var _write = resProto.write

    // Listen for client connection close
    req.on('close', onClose)

    // Wrap native http.OutgoingMessage methods to incept the body chunks
    res.write = function (data, encoding, done) {
      sliceBuffer(data, encoding)
      if (done) done()
    }

    res.end = function (data, encoding, done) {
      if (data && typeof data !== 'function') {
        sliceBuffer(data, encoding)
      }

      eachSeries(buf, writeDefer, end)

      function end() {
        cleanup()
        res.end(done)
      }
    }

    function writeDefer(chunk, next) {
      setTimeout(function () {
        if (closed) return next('closed')
        _write.call(res, chunk.data, chunk.encoding, next)
      }, windowSize)
    }

    function onClose() {
      closed = true
      cleanup()
    }

    function sliceBuffer(data, encoding) {
      if (!data) return

      var length = data.length
      var chunks = ((length / chunkSize) | 0) + 1

      for (var i = 0; i < length; i += chunkSize) {
        buf.push({ 
          data: data.slice(i, i + chunkSize),
          encoding: encoding
        })
      }
    }

    function cleanup() {
      res.end = _end
      res.write = _write
      _end = _write = resProto = buf = null
      req.removeListener('close', onClose)
    }

    next()
  }
}

function eachSeries(arr, iterator, cb) {
  var stack = arr.slice()
  var length = iterator.length

  function next(err) {
    if (err) return cb(err)

    var job = stack.shift()
    if (!job) return cb()

    if (length > 1) iterator(job, next)
    else next(iterator(job))
  }

  next()
}
