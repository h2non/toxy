const rocky = require('rocky')
const Base = rocky.Base
const rules = require('./rules')
const poisons = require('./poisons')
const Directive = require('./directive')
const Poison = require('./poison')

module.exports = rocky.Rocky

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
  return stackCallProxy(this._poisons.stack, 'disable', poison)
}

Base.prototype.enable = function (poison) {
  return stackCallProxy(this._poisons.stack, 'enable', poison)
}

Base.prototype.enableRule = function (rule) {
  return stackCallProxy(this._rules.stack, 'enable', rule)
}

Base.prototype.disableRule = function (rule) {
  return stackCallProxy(this._rules.stack, 'disable', rule)
}

Base.prototype.isPoisonEnabled = function (poison) {
  return stackCallProxy(this._poisons.stack, 'isEnabled', poison)
}

Base.prototype.isRuleEnabled = function (rule) {
  return stackCallProxy(this._rules.stack, 'isEnabled', rule)
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

Base.prototype.getPoisons = function () {
  return this._poisons.stack.map(function (fn) {
    return fn.$of
  })
}

Base.prototype.getRules = function () {
  return this._rules.stack.map(function (fn) {
    return fn.$of
  })
}

Base.prototype.flushAll =
Base.prototype.flushAllPoisons = function () {
  this._poisons.stack.splice(0)
  return this
}

Base.prototype.flushAllRules = function () {
  this._rules.stack.splice(0)
  return this
}

function stackCallProxy(stack, action, name) {
  for (var i = 0, l = stack.length; i < l; i += 1) {
    if (stack[i].$name === name || stack[i].$of === name) {
      return stack[i].$of[action]()
    }
  }
  return false
}
