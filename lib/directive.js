const midware = require('midware')

module.exports = Directive

function Directive(directive) {
  if (typeof directive !== 'function') {
    throw new TypeError('First argument must be a function')
  }

  this.directive = directive
  this._rules = midware()
}

Directive.prototype.rule =
Directive.prototype.filter = function (rule) {
  var r = new Directive(rule)
  this._rules(r.handler())
  return this
}

Directive.prototype.handler = function () {
  var self = this

  function handler(req, res, next) {
    if (self.disabled === true) return next()
    self._rules.run(req, res, handle.bind(self))

    function handle(filter) {
      if (filter === true) return next()
      if (filter) return next(filter)
      self.directive(req, res, next)
    }
  }

  handler.$of = this
  handler.$name = this.directive.$name || this.directive.name

  return handler
}

Directive.prototype.isEnabled = function () {
  return this.disabled !== false
}

Directive.prototype.disable = function () {
  return this.disabled = true
}

Directive.prototype.enable = function () {
  return this.disabled = false
}
