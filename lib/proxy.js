const rocky = require('rocky')
const RockyBase = rocky.Base
const Rule = require('./rule')
const rules = require('./rules')
const poisons = require('./poisons')
const Directive = require('./directive')

module.exports = rocky.Rocky

RockyBase.prototype.rule =
RockyBase.prototype.filter = Directive.prototype.rule

RockyBase.prototype.withRule =
RockyBase.prototype.poisonRule =
RockyBase.prototype.poisonFilter = function (rule) {
  if (this.lastPoison) {
    this.lastPoison.rule(rule)
  }
  return this
}

RockyBase.prototype.enable = function (poison) {
  return this._callMethod(this._poisons, 'enable', poison)
}

RockyBase.prototype.disable = function (poison) {
  return this._callMethod(this._poisons, 'disable', poison)
}

RockyBase.prototype.remove = function (poison) {
  return this._remove(this_poisons, poison)
}

RockyBase.prototype.isEnabled = function (poison) {
  return this._callMethod(this._poisons, 'isEnabled', poison)
}

RockyBase.prototype.disableAll =
RockyBase.prototype.disablePoisons = function () {
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

RockyBase.prototype.poison =
RockyBase.prototype.usePoison = function (poison) {
  if (!(poison instanceof Directive)) {
    poison = new Directive(poison)
  }

  this._poisons(poison.handler())
  this.lastPoison = poison
  return this
}

Object.keys(Rule.prototype).forEach(function (key) {
  RockyBase.prototype[key] = Rule.prototype[key]
})
