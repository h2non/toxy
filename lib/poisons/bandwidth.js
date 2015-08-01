const throttler = require('./throttle')

module.exports = function bandwidth(opts) {
  opts = opts || {}
  opts.bps = (+opts.bps || 1024)
  opts.threshold = +opts.threshold || 1000

  var throttle = throttler(opts)
  return function bandwidth(req, res, next) {
    throttle(req, res, next)
  }
}
