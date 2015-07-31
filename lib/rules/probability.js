module.exports = function probability(percent) {
  percent = +Math.min(percent, 100) || 50

  return function (req, res, next) {
    var rand = Math.round(Math.random() * 10)
    var perc = Math.round(percent * 0.1)
    next(rand > perc)
  }
}
