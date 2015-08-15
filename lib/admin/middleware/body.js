const getRawBody = require('raw-body')

module.exports = function (req, res, next) {
  if (req.method === 'GET' || req.method === 'DELETE') return next()

  if (isInvalidType(req)) {
    res.statusCode = 415
    return res.end()
  }

  getRawBody(req, {
    length: req.headers['content-length'],
    limit: '1mb',
    encoding: 'utf8'
  }, getBody)

  function getBody(err, body) {
    if (err) return next(err)
    parseBody(body)
  }

  function parseBody(body) {
    try {
      req.body = JSON.parse(body)
      next()
    } catch (err) {
      next(err)
    }
  }
}

function isInvalidType(req) {
  return /^application\/json/i.test(req.headers['content-type']) === false
}
