module.exports = function contentType (filter) {
  if (typeof filter === 'string') {
    filter = new RegExp(filter, 'i')
  }

  return function contentType (req, res, next) {
    const type = req.headers['content-type']
    if (!type) return next(null, true)

    const notMatches = !filter.test(type)
    next(null, notMatches)
  }
}
