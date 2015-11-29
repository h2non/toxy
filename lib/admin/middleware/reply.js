module.exports = function reply (req, res, next) {
  res.reply = function (data, code) {
    res.statusCode = +code || 200
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(data))
  }
  next()
}
