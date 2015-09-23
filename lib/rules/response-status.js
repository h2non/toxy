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
  var include = opts.include

  return function responseStatus(req, res, next) {
    var status = res.statusCode
    if (!status) return next(null)

    if (value) {
      return next(null, !(status === value))
    }

    if (lower && higher) {
      return next(null, !(status < lower && status > higher))
    }

    if (lower) {
      return next(null, !(status < lower))
    }

    if (higher) {
      return next(null, !(status > higher))
    }

    if (include) {
      return next(null, !~include.indexOf(status))
    }

    return next(null, !inRange(status))
  }

  function inRange(status) {
    return status >= range[0]
        && status <= range[1]
  }
}
