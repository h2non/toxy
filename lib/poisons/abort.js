module.exports = function abort(opts) {
  opts = opts || {}
  var delay = +opts.delay || 10

  return function abort(req, res, next) {
    setTimeout(destroy, delay)

    function destroy() {
      try {
        req.destroy(opts.error)
      } catch (e) {
        next(e)
      }
    }
  }
}
