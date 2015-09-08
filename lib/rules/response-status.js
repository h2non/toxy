module.exports = function responseStatus(opts) {
  if (typeof opts === 'number') {
    opts = { value: opts }
  }
  else if (Array.isArray(opts)) {
    opts = { range: opts }
  }

  opts = opts || {}

  var lower = +opts.lower
  var higher = +opts.higher
  var value = +opts.value
  var range = opts.range || [200, 300]

  return function responseStatus(req, res, next) {
    var status = res.statusCode
    if (!status) return next(null)

    if (value) {
      return next(null, !(status === value))
    }

    if (lower) {
      return next(null, !(status < lower))
    }

    if (higher) {
      return next(null, !(status > higher))
    }

    var match = status >= range[0] && status <= range[1]
    return next(null, !match)
  }
}
