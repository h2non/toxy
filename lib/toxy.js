const rocky = require('rocky')
const midware = require('midware')
const Base = rocky.Base
const Rocky = rocky.Rocky
const Route = rocky.Route
const rules = require('./rules')
const poisons = require('./poisons')

module.exports = Toxify

function Toxify(opts) {
  Rocky.call(this, opts)
  this.rules = midware()
  this.poisons = midware()
  setup(this)

  this.route = function (method, path) {
    var route = this.__proto__.route.apply(this, arguments)
    route.rules = midware()
    route.poisons = midware()
    setup(route)
    return route
  }
}

Toxify.prototype = Object.create(Rocky.prototype)

Base.prototype.usePoison = function (poison) {
  this.poisons(poison)
  return this
}

Base.prototype.useRule = function (rule) {
  this.rules(rule)
  return this
}

poisons.forEach(function (poison) {
  Base.prototype[poison.name] = function () {
    this.usePoison(poison.apply(null, arguments))
    return this
  }
})

rules.forEach(function (rule) {
  Base.prototype[rule.name] = function () {
    this.useRule(rule.apply(null, arguments))
    return this
  }
})

function setup(self) {
  self.use(function (req, res, next) {
    self.rules.run(req, res, function (filter) {
      if (!filter) return next()
      self.poisons.run(req, res, next)
    })
  })
}
