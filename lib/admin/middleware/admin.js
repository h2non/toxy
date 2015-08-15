module.exports = function (admin) {
  return function (req, res, next) {
    req.admin = admin
    next()
  }
}
