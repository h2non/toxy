const rocky = require('rocky')
const Rule = require('./rule')
const rules = require('./rules')
const Poison = require('./poison')
const poisons = require('./poisons')
const Directive = require('./directive')

const responseBody = rocky.middleware.responseBody
responseBody.$name = '$outgoingInterceptor$'

module.exports = rocky.Rocky

var RockyBase = rocky.Base

RockyBase.prototype.rule =
RockyBase.prototype.filter = Directive.prototype.rule

RockyBase.prototype.enable = function (poison, phase) {
  return this._callMethod(this._poisonsStack(), 'enable', poison)
}

RockyBase.prototype.disable = function (poison, phase) {
  return this._callMethod(this._poisonsStack(phase), 'disable', poison)
}

RockyBase.prototype.remove = function (poison, phase) {
  var stack = this._poisonsStack(phase || 'incoming')
  return this._remove(stack, poison)
}

RockyBase.prototype.removeIncoming = function (poison) {
  return this.remove(poison, 'incoming')
}

RockyBase.prototype.removeOutgoing = function (poison) {
  return this.remove(poison, 'outgoing')
}

RockyBase.prototype.isEnabled = function (poison, phase) {
  return this._callMethod(this._poisonsStack(phase), 'isEnabled', poison)
}

RockyBase.prototype.disableAll =
RockyBase.prototype.disablePoisons = function () {
  return this._disableAll(this._poisonsStack())
}

RockyBase.prototype.getPoison = function (poison, phase) {
  var match = this._getDirective(this._poisonsStack(phase), poison)

  if (!match) return null
  if (phase && match.phase !== phase) return null

  return match
}

RockyBase.prototype.getPoisons = function () {
  return this._getAll(this._poisonsStack())
}

RockyBase.prototype.getIncomingPoisons = function () {
  return this._getAll(this._inPoisons)
}

RockyBase.prototype.getOutgoingPoison = function () {
  return this._getAll(this._outPoisons)
}

RockyBase.prototype.withRule =
RockyBase.prototype.poisonRule =
RockyBase.prototype.poisonFilter = function (rule) {
  if (this.lastPoison) {
    this.lastPoison.rule(rule)
  }
  return this
}

RockyBase.prototype.flush =
RockyBase.prototype.flushPoisons = function () {
  this._inPoisons.stack.splice(0)
  this._outPoisons.stack.splice(0)
  return this
}

RockyBase.prototype.poison =
RockyBase.prototype.usePoison =
RockyBase.prototype.incomingPoison = function (poison) {
  poison = createPoison(poison)
  this._inPoisons(poison.handler())
  this.lastPoison = poison
  return this
}

RockyBase.prototype.outgoingPoison =
RockyBase.prototype.responsePoison = function (poison) {
  poison = createPoison(poison)

  if (!this._outPoisonsEnabled) {
    this._outPoisonsEnabled = true
    this.poison(responseBody(function (req, res, next) {
      this._outPoisons.run(req, res, next)
    }.bind(this)))
  }

  poison.phase = 'outgoing'
  this._outPoisons(poison.handler())
  this.lastPoison = poison

  return this
}

RockyBase.prototype._poisonsStack = function (phase) {
  if (phase) {
    return phase === 'outgoing'
      ? this._outPoisons
      : this._inPoisons
  }

  var inPoisons = this._inPoisons.stack
  var outPoisons = this._outPoisons.stack
  var stack = inPoisons.concat(outPoisons)

  return { stack: stack }
}

/**
 * Extend prototype chain
 */

Object.keys(Rule.prototype).forEach(function (key) {
  RockyBase.prototype[key] = Rule.prototype[key]
})

/**
 * Private helpers
 */

function createPoison(poison) {
  return (poison instanceof Poison)
    ? poison
    : new Poison(poison)
}
