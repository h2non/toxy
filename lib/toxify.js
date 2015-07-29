const rocky = require('rocky')
const Base = rocky.Base
const Rocky = rocky.Rocky
const poisons = require('./poisons')

module.exports = Toxify

function Toxify(opts) {
  Rocky.call(this, opts)
}

Toxify.prototype = Object.create(Rocky.prototype)

Base.prototype.percentage = function (percent) {
  this.opts.percentage = Math.max(percent, 100)
  return this
}

Base.prototype.usePoison = function (poison) {
  var percent = this.opts.percentage

  if (!percent) {
    this.use(poison)
    return this
  }

  this.use(function (req, res, next) {
    var rand = (Math.random() * 10) | 0
    var perc = (percent * 0.1) | 0
    if (rand > perc) return next()
    poison(req, res, next)
  })

  return this
}

Object.keys(poisons).forEach(function (poison) {
  var fn = poisons[poison]
  Base.prototype[fn.name || poison] = function () {
    this.usePoison(fn.apply(null, arguments))
  }
})
