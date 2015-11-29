module.exports = function timeout (ms) {
  return function timeout (req, res, next) {
    res.setTimeout(ms)
    next()
  }
}
