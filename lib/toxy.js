const rocky = require('rocky')
const midware = require('midware')
const Base = rocky.Base
const Rocky = rocky.Rocky
const rules = require('./rules')
const poisons = require('./poisons')
const Directive = require('./directive')
const Poison = require('./poison')

module.exports = Toxy

function Toxy(opts) {
  Rocky.call(this, opts)
  this._rules = midware()
  this._poisons = midware()
  setup(this)
}

Toxy.prototype = Object.create(Rocky.prototype)

Base.prototype.poison =
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
Base.prototype.filter = Directive.prototype.rule

Base.prototype.poisonRule =
Base.prototype.poisonFilter = function (rule) {
  if (!this.lastPoison) return this
  this.lastPoison.rule(rule)
  return this
}

Base.prototype.disable = function (poison) {
  return this._stackProxy(this._poisons.stack, 'disable', poison)
}

Base.prototype.enable = function (poison) {
  return this._stackProxy(this._poisons.stack, 'enable', poison)
}

Base.prototype.enableRule = function (rule) {
  return this._stackProxy(this._rules.stack, 'enable', rule)
}

Base.prototype.disableRule = function (rule) {
  return this._stackProxy(this._rules.stack, 'disable', rule)
}

Base.prototype.isPoisonEnabled = function (poison) {
  return this._stackProxy(this._poisons.stack, 'isEnabled', poison)
}

Base.prototype.isRuleEnabled = function (rule) {
  return this._stackProxy(this._rules.stack, 'isEnabled', rule)
}

Base.prototype.disableAll = function () {
  return this._disableAll(this._poisons)
}

Base.prototype.disableAllRules = function () {
  return this._disableAll(this._rules)
}

Base.prototype._disableAll = function (mw) {
  mw.stack.forEach(function (fn) {
    fn.$of.disable()
  })
  return this
}

Base.prototype.flushAll = function () {
  return this._flushAll(this._poisons)
}

Base.prototype.flushAllRules = function () {
  return this._flushAll(this._rules)
}

Base.prototype._flushAll = function (mw) {
  mw.stack.splice(0)
  return this
}

Base.prototype._stackProxy = function (stack, action, name) {
  for (var i = 0, l = stack.length; i < l; i += 1) {
    if (stack[i].$name === name || stack[i].$of === name) {
      return stack[i].$of[action]()
    }
  }
  return false
}

function setup(self) {
  self.route = function (method, path) {
    var route = self.__proto__.route.apply(self, arguments)
    route._rules = midware()
    route._poisons = midware()
    setup(route)
    return route
  }

  self.use(function (req, res, next) {
    self._rules.run(req, res, function (filter) {
      if (filter === true) return next()
      if (filter) return next(filter)
      self._poisons.run(req, res, next)
    })
  })
}
