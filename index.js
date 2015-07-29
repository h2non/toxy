const Toxify = require('./lib/toxify')

module.exports = toxify

function toxify(opts) {
  return new Toxify(opts)
}

toxify.poisons = require('./lib/poisons')
toxify.VERSION = require('./package.json').version
