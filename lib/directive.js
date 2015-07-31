const midware = require('midware')

module.exports = Directive

function Directive(directive) {
  if (typeof directive !== 'function') {
    throw new TypeError('First argument must be a function')
  }

  this.directive = directive
  this.rules = midware()
}

Directive.prototype.rule =
Directive.prototype.filter = function (rule) {
  this.rules(rule)
  return this
}

Directive.prototype.handler = function () {
  return function (req, res, next) {
    if (this.disabled === true) return next()
    this.rules.run(req, res, handle.bind(this))

    function handle(filter) {
      if (filter === true) return next()
      if (filter) return next(filter)
      this.directive(req, res, next)
    }
  }.bind(this)
}

Directive.prototype.disable = function () {
  this.disabled = true
  return this
}

Directive.prototype.enable = function () {
  this.disabled = false
  return this
}
