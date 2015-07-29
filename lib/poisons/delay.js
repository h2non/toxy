module.exports = function delay(opts, filter) {
  opts = opts || {}
  var max = +opts.max || 1000
  var min = +opts.min || 100

  return function (req, res, next) {
    var defer = delay(req, next)

    if (filter) {
      return filter(req, res, defer)
    }

    defer()
  }

  function delay(req, next) {
    return function (err, invalid) {
      if (err) return next(err)
      if (invalid) return next()

      var timeout = setTimeout(next, calculateDelay())
      req.once('close', cleanTimeout)

      function cleanTimeout() {
        clearTimeout(timeout)
      }

      function clean() {
        req.removeEventListener('close', cleanTimeout)
        next()
      }
    }
  }

  function calculateDelay() {
    if (opts.jitter) return opts.jitter
    return Math.random() * (max - min) + min
  }
}
