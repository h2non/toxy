module.exports = function probability(num) {
  var percent = +Math.min(num, 100) || 50

  return function probability(req, res, next) {
    if (percent === 100) return next()

    var rand = Math.round(Math.random() * 100)
    var notMatches = rand > percent

    next(null, notMatches)
  }
}
