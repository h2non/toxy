const getRawBody = require('raw-body')
const isRegExp = require('../common').isRegExp

module.exports = function body(opts) {
  opts = opts || {}

  var match = opts.match
  var limit = opts.limit || '5mb'
  var encoding = opts.encoding || 'utf8'

  return function body(req, res, next) {
    if (req.method === 'GET' || req.method === 'HEAD') {
      return next(null, true)
    }

    if (req.body) {
      return handleBody(null, req.body)
    }

    var bodyOpts = {
      limit: limit,
      encoding: encoding,
      length: getLength(req)
    }

    getRawBody(req, bodyOpts, handleBody)

    function handleBody(err, body) {
      if (err) return next(err)

      // Expose cached body in the request to forward it
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

  function getLength(req) {
    return +opts.length
      || +req.headers['content-length']
  }
}
