const Toxy = require('./lib/toxy')

module.exports = toxy

function toxy(opts) {
  return new Toxy(opts)
}

toxy.poisons = require('./lib/poisons')
toxy.VERSION = require('./package.json').version
