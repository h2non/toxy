const throttler = require('./throttle')

module.exports = function bandwidth (opts) {
  if (typeof opts === 'number') {
    opts = { bytes: opts }
  }

  opts = opts || {}
  opts.bytes = +opts.bps || +opts.bytes || 1024
  opts.threshold = +opts.threshold || 1000

  var throttle = throttler(opts)
  return function bandwidth (req, res, next) {
    throttle(req, res, next)
  }
}
