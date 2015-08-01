module.exports = function slowOpen(opts) {
  opts = opts || {}
  var delay = +opts.delay || 1000

  return function slowOpen(req, res, next) {
    var timeout = setTimeout(delayNext, delay)
    req.once('close', cleanup)

    function delayNext() {
      timeout = null
      next()
    }

    function cleanup() {
      if (timeout !== null) {
        clearTimeout(timeout)
      }
    }
  }
}
