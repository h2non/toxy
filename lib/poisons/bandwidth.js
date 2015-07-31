const throttler = require('./throttle')

module.exports = function bandwidth(opts) {
  opts = opts || {}
  opts.chunk = +opts.bps || 1024
  opts.window = 1000

  var throttle = throttler(opts)
  return function bandwidth(req, res, next) {
    throttle(req, res, next)
  }
}
