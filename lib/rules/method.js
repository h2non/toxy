module.exports = function method(opts) {
  if (typeof opts === 'string') {
    opts = { method: opts }
  }

  opts = opts || {}
  opts.method = opts.method || ''

  return function method(req, res, next) {
    var filter = req.method === opts.method.toUpperCase()
      || (Array.isArray(opts.methods)
      && !!~opts.methods.indexOf(req.method))

    next(!filter)
  }
}
