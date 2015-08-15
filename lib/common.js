exports.isRegExp = function isRegExp(o) {
  return o && Object.prototype.toString.call(o) === '[object RegExp]'
}

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

exports.sliceBuffer = function sliceBuffer(size, buffer, encoding, target) {
  if (!buffer) return

  var length = buffer.length
  var chunks = ((length / size) | 0) + 1

  for (var i = 0; i < length; i += size) {
    target.push({
      buffer: buffer.slice(i, i + size),
      encoding: encoding
    })
  }
}

exports.randomId = function (head, tail) {
  var id = 0
  var seed = head + '|' + tail
  var len = seed.length
  while (len--) { id += seed.charCodeAt(len) }
  return id.toString(16).slice(0, 10)
}
