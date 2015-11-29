const isRegExp = require('./is-regexp')

module.exports = function matchBody (body, match) {
  if (typeof match === 'function') {
    return match(body)
  }

  if (typeof match === 'string') {
    return !!~body.indexOf(match)
  }

  if (isRegExp(match)) {
    return match.test(body)
  }

  return false
}
