const rocky = require('rocky')
const midware = require('midware')
const Base = rocky.Base
const Rocky = rocky.Rocky
const rules = require('./rules')
const poisons = require('./poisons')
const Directive = require('./directive')
const Poison = require('./poison')

module.exports = Toxify

function Toxify(opts) {
  Rocky.call(this, opts)
  this._rules = midware()
  this._poisons = midware()
  this._overwrite()
  setup(this)
}

Toxify.prototype = Object.create(Rocky.prototype)

Base.prototype.poison    =
Base.prototype.usePoison = function (poison) {
  if (poison instanceof Poison) {
    this._poisons(poison.handler())
    return poison
  }

  var p = new Poison(poison)
  this._poisons(p.handler())
  this.lastPoison = p

  return this
}

Base.prototype.rule =
Base.prototype.filter =
Base.prototype.useRule = function (rule) {
  this._rules(rule)
  return this
}

Base.prototype.poisonRule =
Base.prototype.poisonFilter =
Base.prototype.usePoisonRule = function (rule) {
  if (!this.lastPoison) return this
  this.lastPoison.rule(rule)
  return this
}

Base.prototype._overwrite = function () {
  this.route = function (method, path) {
    var route = this.__proto__.route.apply(this, arguments)
    route._rules = midware()
    route._poisons = midware()
    setup(route)
    return route
  }
}

Toxify.poisons =
Toxify.prototype.poisons = Object.create(null)

poisons.forEach(function (poison) {
  Toxify.prototype.poisons[poison.name] = function () {
    return poison.apply(null, arguments)
  }
})

Toxify.rules =
Toxify.prototype.rules = Object.create(null)

rules.forEach(function (rule) {
  Toxify.prototype.rules[rule.name] = function () {
    return rule.apply(null, arguments)
  }
})

function setup(self) {
  self.use(function (req, res, next) {
    self._rules.run(req, res, function (filter) {
      if (filter === true) return next()
      if (filter) return next(filter)
      self._poisons.run(req, res, next)
    })
  })
}
