const Toxy = require('./lib/toxy')
const rules = require('./lib/rules')
const poisons = require('./lib/poisons')

/**
 * API factory
 */

module.exports = Toxy

/**
 * Expose internal modules as static members
 */

Toxy.admin = require('./lib/admin')
Toxy.Rule = require('./lib/rule')
Toxy.Base = require('./lib/base')
Toxy.Poison = require('./lib/poison')
Toxy.Directive = require('./lib/directive')
Toxy.Rocky = require('rocky').Rocky

/**
 * Expose current version
 */

Toxy.VERSION = require('./package.json').version

/**
 * Expose built-in poisons
 */

Toxy.poisons = Toxy.prototype.poisons = Object.create(null)

poisons.forEach(function (poison) {
  Toxy.poisons[poison.name] = function () {
    return poison.apply(null, arguments)
  }
})

/**
 * Expose built-in rules
 */

Toxy.rules = Toxy.prototype.rules = Object.create(null)

rules.forEach(function (rule) {
  Toxy.rules[rule.name] = function () {
    return rule.apply(null, arguments)
  }
})

/**
 * Extend built-in rules
 */

Toxy.addRule = addDirective('rules')

/**
 * Extend built-in poisons
 */

Toxy.addPoison = addDirective('poisons')

/**
 * Add directive helper
 */

function addDirective (type) {
  return function (name, directive) {
    if (typeof name === 'function') {
      directive = name
    }

    if (typeof directive !== 'function') {
      throw new TypeError('Directive must be a function')
    }

    name = typeof name === 'string'
      ? name
      : directive.name

    if (!name) {
      throw new TypeError('Directive function must have a name')
    }

    directive.$name = name
    Toxy[type][name] = directive

    return Toxy
  }
}
