const Rule = require('./rule')

module.exports = Directive

/**
 * Directive encapsulates a directive function providing convenient
 * methods and abstractions used by toxy higher layers to manage and configure directives.
 *
 * @param {Function} directive
 * @class Directive
 * @extends Rule
 */

function Directive (directive) {
  Rule.call(this)
  this.enabled = true
  this.directive = directive
  this.name = directive.$name || directive.name
}

Directive.prototype = Object.create(Rule.prototype)

Directive.prototype.disable = function () {
  this.enabled = false
  return this.enabled
}

Directive.prototype.enable = function () {
  this.enabled = true
  return this.enabled
}

Directive.prototype.isEnabled = function () {
  return this.enabled
}

Directive.prototype.rule =
Directive.prototype.filter = function (rule) {
  if (!(rule instanceof Directive)) {
    rule = new Directive(rule)
  }

  this._rules(rule.handler())
  return this
}

Directive.prototype.handler = function () {
  const self = this

  function handler (req, res, next) {
    if (self.enabled === false) return next()
    self._rules.run(req, res, handle)

    function handle (err, filter) {
      if (err) return next(err)
      if (filter === true) return next()
      self.directive(req, res, next)
    }
  }

  handler.$of = this
  handler.$name = this.name

  return handler
}
