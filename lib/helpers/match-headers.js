const isRegExp = require('./is-regexp')

module.exports = function matchHeaders(httpObj, headers) {
  return Object.keys(headers).every(function (key) {
    var rule = headers[key]
    var value = httpObj.headers[key.toLowerCase()]

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
