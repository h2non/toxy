const getRawBody = require('raw-body')
const isRegExp = require('../common').isRegExp

module.exports = function body(opts) {
  opts = opts || {}
  var match = opts.match

  return function body(req, res, next) {
    getRawBody(req, {
      length: opts.length || req.headers['content-length'],
      limit: opts.limit || '5mb',
      encoding: opts.encoding || 'utf8'
    }, handle)

    function handle(err, body) {
      if (err) return next(err)
      if (typeof body !== 'string') return next(true)
      matcher(body, next)
    }
  }

  function matcher(body, next) {
    if (typeof match === 'function') {
      return next(!match(body))
    }
    if (typeof match === 'string') {
      return next(!~body.indexOf(match))
    }
    if (isRegExp(match)) {
      return next(!match.test(body))
    }
    next(true)
  }
}
