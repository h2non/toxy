module.exports = function throttle(opts) {
  opts = opts || {}
  const chunkSize = +opts.chunk || 1024
  const windowSize = +opts.window || 100

  return function throttle(req, res, next) {
    var buf = []
    var closed = false
    var _write = res.write
    var _end = res.end

    // Wrap native http.OutgoingMessage methods to incept the body chunks
    res.write = function (data, encoding, done) {
      if (!data) return
      if (done) done()
      sliceAndCacheBuffer(data, encoding)
    }

    res.end = function (data, encoding, done) {
      if (data && typeof data !== 'function') {
        sliceAndCacheBuffer(data, encoding)
      }

      eachSeries(buf, writeChunk, end)

      function writeChunk(chunk, next) {
        setTimeout(function () {
          if (closed) return next('closed')
          _write.call(res, chunk.data, chunk.encoding, next)
        }, windowSize)
      }

      function end() {
        if (closed) return
        clean()
        res.end(done)
      }
    }

    // Listen for client connection close
    req.on('close', onClose)

    function onClose() {
      closed = true
      clean()
    }

    function sliceAndCacheBuffer(data, encoding) {
      if (!data) return

      var length = data.length
      if (length <= chunkSize) {
        _write.call(res, data, encoding)
      }

      var chunks = ((length / chunkSize) | 0) + 1

      for (var i = 0; i < length; i += chunkSize) {
        buf.push({ 
          data: data.slice(i, i + chunkSize),
          encoding: encoding
        })
      }
    }

    function clean() {
      res.end = _end
      res.write = _write
      _end = _write = buf = null
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
