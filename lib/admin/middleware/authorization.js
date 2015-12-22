module.exports = function authorization (req, res, next) {
  const apiKey = req.admin.opts.apiKey
  if (!apiKey) return next()

  const token = getToken(req)

  if (token === apiKey) {
    return next()
  }

  res.writeHead(401)
  res.end()
}

function getToken (req) {
  return req.headers['api-key'] ||
    req.headers['x-api-key'] ||
    req.headers['authorization']
}
