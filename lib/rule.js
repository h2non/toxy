const midware = require('midware')
const Base = require('./base')

module.exports = Rule

function Rule() {
  this._rules = midware()
}

Rule.prototype.enableRule = function (rule) {
  return this._callMethod(this._rules.stack, 'enable', rule)
}

Rule.prototype.disableRule = function (rule) {
  return this._callMethod(this._rules.stack, 'disable', rule)
}

Rule.prototype.disableRules = function () {
  return this._disableAll(this._rules)
}

Rule.prototype.rules =
Rule.prototype.getRules = function () {
  return this._getAll(this._rules.stack)
}

Rule.prototype.flushRules = function () {
  this._rules.stack.splice(0)
  return this
}

Object.keys(Base.prototype).forEach(function (key) {
  Rule.prototype[key] = Base.prototype[key]
})
