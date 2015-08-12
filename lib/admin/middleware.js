
module.exports = function (admin) {
  admin.use(function (req, res, next) {
    req.admin = admin
    next()
  })

  admin.use(tokenAuthorization)
}

function tokenAuthorization(req, res, next) {
  var apiToken = req.admin.opts.apiToken
  if (!apiToken) return next()

  var token = req.headers['api-token'] || req.headers['authorization']
  if (token === apiToken) {
    return next()
  }

  res.writeHead(401)
  res.end()
}
