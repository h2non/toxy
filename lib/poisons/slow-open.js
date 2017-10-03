module.exports = function slowOpen (opts) {
  opts = opts || {}
  const delay = +opts.delay || 1000

  return function slowOpen (req, res, next) {
    var timeout = setTimeout(delayNext, delay)
    req.once('close', cleanup)

    function delayNext () {
      timeout = null
      req.removeListener('close', cleanup)
      next()
    }

    function cleanup () {
      if (timeout !== null) {
        clearTimeout(timeout)
      }
    }
  }
}
