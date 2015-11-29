const match = require('../helpers').matchHeaders

module.exports = function headers (matchHeaders) {
  matchHeaders = matchHeaders || {}

  return function headers (req, res, next) {
    next(null, !match(req, matchHeaders))
  }
}
