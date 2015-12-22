module.exports = function abort (opts) {
  if (typeof opts === 'number') {
    opts = { delay: opts }
  }

  opts = opts || {}
  const delay = +opts.delay || 10

  return function abort (req, res, next) {
    setTimeout(destroy, delay)

    function destroy () {
      if (req.socket.destroyed) {
        if (!opts.next) return next()
      } else {
        destroySocket(req, next)
      }
    }

    if (opts.next) next()
  }

  function destroySocket (req, next) {
    try {
      req.destroy(opts.error)
    } catch (err) {
      if (!opts.next) next(err)
    }
  }
}
