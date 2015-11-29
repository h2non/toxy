module.exports = function latency (opts) {
  if (typeof opts === 'number') {
    opts = { jitter: opts }
  }

  opts = opts || {}
  var max = +opts.max || 1000
  var min = +opts.min || 100

  return function latency (req, res, next) {
    var timeout = setTimeout(clean, calculateDelay())
    req.once('close', onClose)

    function onClose () {
      clearTimeout(timeout)
      next('client connection closed')
    }

    function clean () {
      req.removeListener('close', onClose)
      next()
    }
  }

  function calculateDelay () {
    if (opts.jitter) return opts.jitter
    return Math.random() * (max - min) + min
  }
}
