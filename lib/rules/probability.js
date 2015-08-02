module.exports = function probability(num) {
  var percent = +Math.min(+num, 100) || 50

  return function probability(req, res, next) {
    var rand = Math.round(Math.random() * 10)
    var perc = Math.round(percent * 0.1)
    next(rand > perc)
  }
}
