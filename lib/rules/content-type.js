module.exports = function contentType (filter) {
  if (typeof filter === 'string') {
    filter = new RegExp(filter, 'i')
  }

  return function contentType (req, res, next) {
    var type = req.headers['content-type']
    if (!type) return next(null, true)

    var notMatches = !filter.test(type)
    next(null, notMatches)
  }
}
