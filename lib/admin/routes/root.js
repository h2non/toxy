const version = require('../../../package.json').version

module.exports = function (req, res) {
  res.reply({
    name: 'toxy admin server',
    version: version,
    links: {
      self: { href: '/' },
      servers: { href: '/servers' }
    }
  })
}
