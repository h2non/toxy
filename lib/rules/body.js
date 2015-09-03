const getRawBody = require('raw-body')
const matchBody = require('../helpers').matchBody

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

      next(null, !matchBody(body, match))
    }
  }

  function getLength(req) {
    return +opts.length
      || +req.headers['content-length']
  }
}
