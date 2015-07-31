const Directive = require('./directive')

module.exports = Poison

function Poison(poison) {
  Directive.call(this, poison)
}

Poison.prototype = Object.create(Directive.prototype)
