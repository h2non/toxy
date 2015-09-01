const rocky = require('rocky')
const Rule = require('./rule')
const rules = require('./rules')
const Poison = require('./poison')
const poisons = require('./poisons')
const Directive = require('./directive')
const responseBody = rocky.middleware.responseBody

module.exports = rocky.Rocky

var RockyBase = rocky.Base

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
  return this._remove(this._poisons, poison)
}

RockyBase.prototype.isEnabled = function (poison) {
  return this._callMethod(this._poisons, 'isEnabled', poison)
}

RockyBase.prototype.disableAll =
RockyBase.prototype.disablePoisons = function () {
  return this._disableAll(this._poisons)
}

RockyBase.prototype.getPoison = function (poison, phase) {
  var poisons = { stack: this.getPoisons() }
  var match = this._getDirective(poisons, poison)

  if (!match) return null
  if (phase && match.phase !== phase) return null

  return match
}

RockyBase.prototype.getPoisons = function () {
  var incoming = this._getAll(this._poisons)
  var stack = this.mw.pool.response || { stack: [] }
  var outgoing = this._getAll(stack)

  function isValid(poison) {
    return poison
      && (poison.phase === 'outgoing'
      ||  poison.phase === 'incoming')
  }

  return incoming
    .concat(outgoing)
    .filter(isValid)
}

RockyBase.prototype.flush =
RockyBase.prototype.flushPoisons = function () {
  this._poisons.stack.splice(0)
  return this
}

RockyBase.prototype.poison =
RockyBase.prototype.usePoison =
RockyBase.prototype.incomingPoison = function (poison) {
  poison = newPoison(poison)
  this._poisons(poison.handler())
  this.lastPoison = poison
  return this
}

RockyBase.prototype.outgoingPoison =
RockyBase.prototype.useOutgoingPoison = function (poison) {
  poison = newPoison(poison)

  // Attach outgoing response wrapper the first time
  if (!this._outgoingEnabled) {
    this._outgoingEnabled = true
    this.poison(responseBody(function (req, res, next) {
      this.mw.run('response', req, res, next)
    }.bind(this)))
  }

  poison.phase = 'outgoing'
  this.useFor('response', poison.handler())
  this.lastPoison = poison

  return this
}

/**
 * Extend prototype chain from Rule
 */

Object.keys(Rule.prototype).forEach(function (key) {
  RockyBase.prototype[key] = Rule.prototype[key]
})

/**
 * Private helpers
 */

function newPoison(poison) {
  return (poison instanceof Poison)
    ? poison
    : new Poison(poison)
}
