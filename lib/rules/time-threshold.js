module.exports = function timeThreshold (opts) {
  if (typeof opts === 'number') {
    opts = { duration: opts }
  }

  var time = Date.now()
  const duration = +opts.duration || 1000
  const threshold = Math.max(+opts.threshold || 1000 * 10, duration)

  return function timeThreshold (req, res, next) {
    const acc = calculate()
    const offset = threshold - acc

    if (acc > threshold) {
      time = Date.now()
      return next(null, false)
    }

    next(null, offset > duration)
  }

  function calculate () {
    const now = Date.now()
    const diff = now - time
    return diff - duration
  }
}
