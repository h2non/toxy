const Directive = require('./directive')

module.exports = Poison

/**
 * Poison encapsulates an HTTP middleware function
 * which is responsible to infect and alter a given HTTP flow.
 *
 * Inherits from Directive to provide convenient methods and abstractions
 * to configure the directive.
 *
 * @param {Function} poison
 * @class Poison
 * @extends Directive
 */

function Poison (poison) {
  Directive.call(this, poison)

  this.phase = 'incoming'
  this._outgoingEnabled = false
}

Poison.prototype = Object.create(Directive.prototype)
