module.exports = function (opts, filter) {
  return function (req, res, next) {
    res.writeHead(+opts.code || 500, opts.headers)
    res.end()
  }
}
