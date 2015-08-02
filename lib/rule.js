const midware = require('midware')
const Base = require('./base')

module.exports = Rule

function Rule() {
  this._rules = midware()
}

Rule.prototype.enableRule = function (rule) {
  return this._callMethod(this._rules, 'enable', rule)
}

Rule.prototype.disableRule = function (rule) {
  return this._callMethod(this._rules, 'disable', rule)
}

Rule.prototype.disableRules = function () {
  return this._disableAll(this._rules)
}

Rule.prototype.isRuleEnabled = function (poison) {
  return this._callMethod(this._rules, 'isEnabled', poison)
}

Rule.prototype.removeRule = function (rule) {
  return this._remove(this._rules, rule)
}

Rule.prototype.rules =
Rule.prototype.getRules = function () {
  return this._getAll(this._rules)
}

Rule.prototype.flushRules = function () {
  this._rules.stack.splice(0)
  return this
}

Object.keys(Base.prototype).forEach(function (key) {
  Rule.prototype[key] = Base.prototype[key]
})
