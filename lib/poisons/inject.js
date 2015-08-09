module.exports = function inject(opts) {
  var code = +opts.code || 500

  return function inject(req, res, next) {
    res.writeHead(code, opts.headers)
    res.end(opts.body, opts.encoding)
  }
}
