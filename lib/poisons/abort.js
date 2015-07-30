module.exports = function abort(delay) {
  return function (req, res, next) {
    console.log('Abort:', req.url)
    if (delay) {
      return setTimeout(function () {
        req.socket.destroy()
      })
    }
    req.socket.destroy()
  }
}
