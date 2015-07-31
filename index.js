const Toxy = require('./lib/toxy')
const rules = require('./lib/rules')
const poisons = require('./lib/poisons')

module.exports = toxy

function toxy(opts) {
  return new Toxy(opts)
}

toxy.Poison = require('./lib/poison')
toxy.Directive = require('./lib/directive')
toxy.VERSION = require('./package.json').version

toxy.poisons =
Toxy.prototype.poisons = Object.create(null)

poisons.forEach(function (poison) {
  Toxy.prototype.poisons[poison.name] = function () {
    return poison.apply(null, arguments)
  }
})

toxy.rules =
Toxy.prototype.rules = Object.create(null)

rules.forEach(function (rule) {
  Toxy.prototype.rules[rule.name] = function () {
    return rule.apply(null, arguments)
  }
})
