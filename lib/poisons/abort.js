module.exports = function abort(opts) {
  opts = opts || {}

  return function abort(req, res, next) {
    if (!opts.delay) {
      return req.destroy(opts.error)
    }

    setTimeout(function () {
      req.destroy(opts.error)
    }, opts.delay)
  }
}
