module.exports = function method(opts) {
  return function (req, res, next) {
    var filter = req.method === opts.method ||
      (Array.isArray(opts.methods) && !!~opts.methods.indexOf(req.method))

    next(filter)
  }
}
