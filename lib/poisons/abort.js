module.exports = function (filter) {
  return function (req, res, next) {
    req.socket.destroy()
  }
}
