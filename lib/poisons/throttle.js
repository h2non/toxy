const Throttle = require('throttle')

module.exports = function throttle(opts, filter) {
  return function (req, res, next) {
    res.pipe(new Throttle(opts))
    next()
  }
}
