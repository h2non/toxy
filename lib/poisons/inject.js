module.exports = function inject(opts) {
  return function inject(req, res, next) {
    res.writeHead(+opts.code || 500, opts.headers)
    res.end(opts.body, opts.encoding)
  }
}
