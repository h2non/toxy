const rocky = require('rocky')
const Rule = require('./rule')
const rules = require('./rules')
const Poison = require('./poison')
const poisons = require('./poisons')
const Directive = require('./directive')

module.exports = rocky.Rocky

var RockyBase = rocky.Base

RockyBase.prototype.rule =
RockyBase.prototype.filter = Directive.prototype.rule

RockyBase.prototype.enable = function (poison, phase) {
  return this._callMethod(getPoisonsStack(this, phase), 'enable', poison)
}

RockyBase.prototype.enableOutgoing = function (poison) {
  return this.enable(poison, 'outgoing')
}

RockyBase.prototype.disable = function (poison, phase) {
  return this._callMethod(getPoisonsStack(this, phase), 'disable', poison)
}

RockyBase.prototype.disableOutgoing = function (poison) {
  return this.disable(poison, 'outgoing')
}

RockyBase.prototype.remove = function (poison, phase) {
  var stack = getPoisonsStack(this, phase || 'incoming')
  return this._remove(stack, poison)
}

RockyBase.prototype.removeOutgoing = function (poison) {
  return this.remove(poison, 'outgoing')
}

RockyBase.prototype.isEnabled = function (poison, phase) {
  var stack = getPoisonsStack(this, phase || 'incoming')
  return this._callMethod(stack, 'isEnabled', poison)
}

RockyBase.prototype.isEnabledOutgoing = function (poison) {
  return this.isEnabled(poison, 'outgoing')
}

RockyBase.prototype.disableAll =
RockyBase.prototype.disablePoisons = function () {
  return this._disableAll(getPoisonsStack(this))
}

RockyBase.prototype.getPoison = function (poison, phase) {
  var stack = getPoisonsStack(this, phase)
  var directive = this._getDirective(stack, poison)

  if (!directive || (phase && directive.phase !== phase)) {
    return null
  }

  return directive
}

RockyBase.prototype.getIncomingPoison = function (poison) {
  return this.getPoison(poison, 'incoming')
}

RockyBase.prototype.getOutgoingPoison = function (poison) {
  return this.getPoison(poison, 'outgoing')
}

RockyBase.prototype.getPoisons = function () {
  return this._getAll(getPoisonsStack(this))
}

RockyBase.prototype.getIncomingPoisons = function () {
  return this._getAll(this._inPoisons)
}

RockyBase.prototype.getOutgoingPoisons = function () {
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
  ['in', 'out'].forEach(function (type) {
    this['_' + type + 'Poisons'].stack.splice(0)
  }.bind(this))
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
RockyBase.prototype.responsePoison =
RockyBase.prototype.useOutgoingPoison = function (poison) {
  if (!this._outgoingEnabled) {
    outgoingInterceptor(this)
  }

  poison = createPoison(poison)
  poison.phase = 'outgoing'
  this._outPoisons(poison.handler())
  this.lastPoison = poison

  return this
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

function outgoingInterceptor(proxy) {
  var responseBody = rocky.middleware.responseBody
  responseBody.$name = '$outgoingInterceptor$'

  var interceptor = responseBody(function (req, res, next) {
    proxy._outPoisons.run(req, res, next)
  })

  proxy._outgoingEnabled = true
  proxy.poison(interceptor)
}

function getPoisonsStack(proxy, phase) {
  if (phase) {
    return phase === 'outgoing'
      ? proxy._outPoisons
      : proxy._inPoisons
  }

  var inPoisons = proxy._inPoisons.stack
  var outPoisons = proxy._outPoisons.stack
  var stack = inPoisons.concat(outPoisons)

  return { stack: stack }
}

function createPoison(poison) {
  return (poison instanceof Poison)
    ? poison
    : new Poison(poison)
}
