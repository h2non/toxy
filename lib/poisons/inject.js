const assign = require('object-assign')

module.exports = function inject(opts) {
  opts = opts || {}

  var code = +opts.code || 500
  var body = opts.body
  var encoding = opts.encoding

  return function inject(req, res, next) {
    var headers = assign({}, res.headers, opts.headers)

    if (body && body.length) {
      headers['content-length'] = body.length
    }

    res.writeHead(code, headers)
    res.end(body, encoding)
  }
}
