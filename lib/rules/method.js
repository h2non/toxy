module.exports = function method(matchMethod) {
  if (typeof matchMethod === 'string') {
    matchMethod = [ matchMethod ]
  }

  if (!matchMethod) {
    matchMethod = [ 'GET' ]
  }

  return function method(req, res, next) {
    var notMatches = !~matchMethod.indexOf(req.method)
    next(null, notMatches)
  }
}
