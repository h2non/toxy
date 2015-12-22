module.exports = function probability (num) {
  const percent = +Math.min(num, 100) || 50

  return function probability (req, res, next) {
    if (percent > 99) return next()

    const rand = Math.round(Math.random() * 100)
    const notMatches = rand > percent

    next(null, notMatches)
  }
}
