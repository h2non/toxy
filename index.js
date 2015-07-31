const Toxy = require('./lib/toxy')

module.exports = toxy

function toxy(opts) {
  return new Toxy(opts)
}

toxy.poisons = Toxy.poisons
toxy.rules = Toxy.rules
toxy.Poison = require('./lib/poison')
toxy.Directive = require('./lib/directive')
toxy.VERSION = require('./package.json').version
