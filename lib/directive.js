const Rule = require('./rule')

module.exports = Directive

function Directive(directive) {
  Rule.call(this)
  this.enabled = true
  this.directive = directive
}

Directive.prototype = Object.create(Rule.prototype)

Directive.prototype.disable = function () {
  return this.enabled = false
}

Directive.prototype.enable = function () {
  return this.enabled = false
}

Directive.prototype.isEnabled = function () {
  return this.enabled
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
    if (self.enabled === false) return next()
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
