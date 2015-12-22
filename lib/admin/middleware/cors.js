module.exports = function (req, res, next) {
  const origin = req.headers.origin
  if (!origin) return next()

  res.setHeader('Access-Control-Allow-Origin', origin)
  res.setHeader('Access-Control-Allow-Credentials', true)

  const requestHeaders = req.headers['access-control-request-headers']
  if (requestHeaders) {
    res.setHeader('Access-Control-Allow-Headers', requestHeaders)
  }

  const requestMethod = req.headers['access-control-request-method']
  if (requestMethod) {
    res.setHeader('Access-Control-Allow-Methods', requestMethod)
  }

  if (req.method === 'OPTIONS') {
    return res.end()
  }

  next()
}
