const match = require('../helpers').matchHeaders

module.exports = function responseHeaders(matchHeaders) {
  matchHeaders = matchHeaders || {}

  return function responseHeaders(res, res, next) {
    next(null, !match(res, matchHeaders))
  }
}
