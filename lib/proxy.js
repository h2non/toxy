const rocky = require('rocky')
const RockyBase = rocky.Base
const Rule = require('./rule')
const rules = require('./rules')
const poisons = require('./poisons')
const Directive = require('./directive')
const Poison = require('./poison')

module.exports = rocky.Rocky

RockyBase.prototype.poison =
RockyBase.prototype.usePoison = function (poison) {
  if (poison instanceof Poison) {
    this._poisons(poison.handler())
    return poison
  }

  var p = new Poison(poison)
  this._poisons(p.handler())
  this.lastPoison = p

  return this
}

RockyBase.prototype.rule =
RockyBase.prototype.filter = Directive.prototype.rule

RockyBase.prototype.poisonRule =
RockyBase.prototype.poisonFilter = function (rule) {
  if (this.lastPoison) {
    this.lastPoison.rule(rule)
  }
  return this
}

RockyBase.prototype.disable = function (poison) {
  return this._callMethod(this._poisons, 'disable', poison)
}

RockyBase.prototype.enable = function (poison) {
  return this._callMethod(this._poisons, 'enable', poison)
}

RockyBase.prototype.isPoisonEnabled = function (poison) {
  return this._callMethod(this._poisons, 'isEnabled', poison)
}


Rule.prototype.disableAll =
Rule.prototype.disablePoisons = function () {
  return this._disableAll(this._poisons)
}

RockyBase.prototype.poisons =
RockyBase.prototype.getPoisons = function () {
  return this._getAll(this._poisons)
}

RockyBase.prototype.flush =
RockyBase.prototype.flushPoisons = function () {
  this._poisons.stack.splice(0)
  return this
}

Object.keys(Rule.prototype).forEach(function (key) {
  RockyBase.prototype[key] = Rule.prototype[key]
})
