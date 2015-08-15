const version = require('../../../package.json').version

module.exports = function (req, res) {
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify({
    name: 'toxy admin server',
    version: version,
    links: {
      self: { href: '/' },
      servers: { href: '/servers' }
    }
  }))
}
