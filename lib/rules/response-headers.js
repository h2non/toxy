const match = require('../helpers').matchHeaders

module.exports = function responseHeaders (matchHeaders) {
  matchHeaders = matchHeaders || {}

  return function responseHeaders (req, res, next) {
    next(null, !match(res, matchHeaders))
  }
}
