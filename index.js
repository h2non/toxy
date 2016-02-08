const Toxy = require('./lib/toxy')

/**
 * Expose `Toxy` API factory
 *
 * @exports {Function}
 */

module.exports = Toxy

/**
 * Exposes admin HTTP server constructor.
 *
 * @property {Function} admin
 * @static
 */

Toxy.admin = require('./lib/admin')

/**
 * Exposes Rule constructor.
 *
 * @property {Rule} Rule
 * @static
 */

Toxy.Rule = require('./lib/rule')

/**
 * Exposes Base object.
 *
 * @property {Object} Base
 * @static
 */

Toxy.Base = require('./lib/base')

/**
 * Exposes Poison constructor.
 *
 * @property {Poison} Poison
 * @static
 */

Toxy.Poison = require('./lib/poison')

/**
 * Exposes Directive constructor.
 *
 * @property {Directive} Directive
 * @static
 */

Toxy.Directive = require('./lib/directive')

/**
 * Exposes Rocky proxy constructor.
 *
 * @property {Rocky} Rocky
 * @static
 */

Toxy.Rocky = require('rocky').Rocky

/**
 * Expose current version.
 *
 * @property {String} VERSION
 * @static
 */

Toxy.VERSION = require('./package.json').version

/**
 * Expose built-in poisons.
 *
 * @property {Object} rules
 * @static
 */

Toxy.poisons = Toxy.prototype.poisons

/**
 * Expose built-in rules.
 *
 * @property {Object} rules
 * @static
 */

Toxy.rules = Toxy.prototype.rules

/**
 * Attaches a new rule.
 *
 * @param {Function} poison
 * @method addPoison
 * @static
 */

Toxy.addRule = addDirective('rules')

/**
 * Attaches a new poison.
 *
 * @param {Function} poison
 * @method addPoison
 * @static
 */

Toxy.addPoison = addDirective('poisons')

/**
 * Add directive helper.
 *
 * @param {String}
 * @function addDirective
 * @private
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
