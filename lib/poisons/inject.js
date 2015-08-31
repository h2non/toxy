const assign = require('object-assign')

module.exports = function inject(opts) {
  opts = opts || {}
  var code = +opts.code || 500

  return function inject(req, res, next) {
    var headers = assign({}, res.headers, opts.headers)
    res.writeHead(code, headers)
    res.end(opts.body, opts.encoding)
  }
}
