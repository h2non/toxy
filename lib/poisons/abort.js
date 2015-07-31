module.exports = function abort(delay) {
  return function (req, res, next) {
    if (delay) {
      return setTimeout(function () {
        req.socket.destroy()
      })
    }
    req.socket.destroy()
  }
}
