const assign = require('object-assign')

module.exports = function inject (opts) {
  opts = opts || {}

  const code = +opts.code || 500
  const body = opts.body
  const encoding = opts.encoding

  return function inject (req, res, next) {
    const headers = assign({}, res.headers, opts.headers)

    if (body && body.length) {
      headers['content-length'] = body.length
    }

    res.writeHead(code, headers)
    res.end(body, encoding)
  }
}
