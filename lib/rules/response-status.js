module.exports = function responseStatus(opts) {
  opts = opts || {}

  if (Array.isArray(opts)) {
    opts = { range: opts }
  }

  var lower = +opts.lower
  var higher = +opts.higher
  var range = opts.range || [200, 400]

  return function responseStatus(req, res, next) {
    var status = res.statusCode
    if (!status) return next(null)

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
