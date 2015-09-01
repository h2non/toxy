const Directive = require('./directive')

module.exports = Poison

function Poison(poison) {
  Directive.call(this, poison)

  this.phase = 'incoming'
  this._outPoisonsEnabled = false
}

Poison.prototype = Object.create(Directive.prototype)
