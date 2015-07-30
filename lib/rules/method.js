module.exports = function method(opts) {
  return function (req, res, next) {
    var filter = req.method === opts.method ||
      ~[].indexOf.call(opts.methods, req.method)

    next(filter)
  }
}
