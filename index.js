const Toxy = require('./lib/toxy')
const rules = require('./lib/rules')
const poisons = require('./lib/poisons')

module.exports = toxy

/**
 * API factory
 */

function toxy(opts) {
  return new Toxy(opts)
}

/**
 * Expose internal modules as static members
 */

toxy.admin     = require('./lib/admin')
toxy.Rule      = require('./lib/rule')
toxy.Base      = require('./lib/base')
toxy.Directive = require('./lib/directive')
toxy.Rocky     = require('rocky').Rocky

/**
 * Expose current version
 */

toxy.VERSION = require('./package.json').version

/**
 * Expose built-in poisons
 */

toxy.poisons = Toxy.prototype.poisons = Object.create(null)

poisons.forEach(function (poison) {
  toxy.poisons[poison.name] = function () {
    return poison.apply(null, arguments)
  }
})

/**
 * Expose built-in rules
 */

toxy.rules = Toxy.prototype.rules = Object.create(null)

rules.forEach(function (rule) {
  toxy.rules[rule.name] = function () {
    return rule.apply(null, arguments)
  }
})

/**
 * Extend built-in rules
 */

toxy.addRule = addDirective('rules')

/**
 * Extend built-in poisons
 */

toxy.addPoison = addDirective('poisons')

/**
 * Add directive helper
 */

function addDirective(type) {
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
    toxy[type][name] = directive

    return toxy
  }
}
