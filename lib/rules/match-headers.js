module.exports = function matchHeaders(headers) {
  headers = headers || {}

  return function matchHeaders(req, res, next) {
    next(!matcher(req, headers))
  }
}

function matcher(req, headers) {
  return Object.keys(headers)
  .every(function (key) {
    var rule = headers[key]
    var value = req.headers[key.toLowerCase()]

    if (typeof rule === 'boolean') {
      return rule ? value != null : value == null
    }

    if (isRegExp(rule)) {
      return rule.test(value)
    }

    if (typeof rule === 'string') {
      return new RegExp(rule, 'i').test(value)
    }

    if (typeof rule === 'function') {
      return rule(value, key)
    }

    return false
  })
}

function isRegExp(o) {
  return o && Object.prototype.toString.call(o) === '[object RegExp]'
}
