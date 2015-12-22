module.exports = function eachSeries (arr, iterator, cb) {
  cb = cb || function () {}
  if (!Array.isArray(arr) || !arr.length) return cb()

  const stack = arr.slice()
  const length = iterator.length

  function next (err) {
    if (err) return cb(err)

    const job = stack.shift()
    if (!job) return cb()

    if (length > 1) iterator(job, next)
    else next(iterator(job))
  }

  next()
}
