module.exports = function authorization (req, res, next) {
  var apiKey = req.admin.opts.apiKey
  if (!apiKey) return next()

  var token = req.headers['api-key']
    || req.headers['x-api-key']
    || req.headers['authorization']

  if (token === apiKey) {
    return next()
  }

  res.writeHead(401)
  res.end()
}
