module.exports = function delay(opts) {
  opts = opts || {}
  var max = +opts.max || 1000
  var min = +opts.min || 100

  return function delay(req, res, next) {
    var timeout = setTimeout(next, calculateDelay())
    req.once('close', cleanTimeout)

    function cleanTimeout() {
      clearTimeout(timeout)
      next('client connection closed')
    }

    function clean() {
      req.removeEventListener('close', cleanTimeout)
      next()
    }
  }

  function calculateDelay() {
    if (opts.jitter) return opts.jitter
    return Math.random() * (max - min) + min
  }
}
