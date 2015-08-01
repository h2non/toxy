module.exports = function abort(opts) {
  opts = opts || {}

  return function abort(req, res, next) {
    setTimeout(function () {
      try { destroy() } catch (e) {}
    }, opts.delay)

    function destroy() {
      req.destroy(opts.error)
    }
  }
}
