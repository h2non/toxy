const matchBody = require('../helpers').matchBody

module.exports = function responseBody (opts) {
  opts = opts || {}

  const match = opts.match
  const encoding = opts.encoding || 'utf8'

  return function responseBody (req, res, next) {
    var body = res.body
    if (!body) return next(null, true)

    if (Buffer.isBuffer(body)) {
      body = body.toString(encoding)
    }

    next(null, !matchBody(body, match))
  }
}
