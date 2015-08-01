exports.eachSeries = function eachSeries(arr, iterator, cb) {
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

exports.sliceBuffer = function sliceBuffer(size, buffer, encoding, cache) {
  if (!buffer) return

  var length = buffer.length
  var chunks = ((length / size) | 0) + 1

  for (var i = 0; i < length; i += size) {
    cache.push({
      buffer: buffer.slice(i, i + size),
      encoding: encoding
    })
  }
}
