const getRawBody = require('raw-body')
const isRegExp = require('../common').isRegExp

module.exports = function body(opts) {
  opts = opts || {}
  var match = opts.match

  return function body(req, res, next) {
    if (req.method === 'GET' || req.method === 'HEAD') {
      return next(null, true)
    }

    if (req.body) {
      return handleBody(null, req.body)
    }

    getRawBody(req, {
      length: opts.length || req.headers['content-length'],
      limit: opts.limit || '5mb',
      encoding: opts.encoding || 'utf8'
    }, handleBody)

    function handleBody(err, body) {
      if (err) return next(err)

      // We must expose cached body in the request to forward it properly
      req.body = body

      if (typeof body !== 'string') {
        return next(null, true)
      }

      var notMatches = !matcher(body, next)
      next(null, notMatches)
    }
  }

  function matcher(body, next) {
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
}
