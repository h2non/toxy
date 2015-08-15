const routes = require('./routes')
const directives = require('./directives')

exports.all = function (req, res) {
  var servers = req.admin.stack.map(server)
  res.reply(servers)
}

exports.get = function (req, res) {
  res.reply(fullServer(req))
}

exports.delete = function (req, res) {
  req.admin.remove(req.toxy.id)
  res.statusCode = 204
  res.end()
}

function server(toxy) {
  var href = '/servers/' + toxy.id

  var server = {
    id: toxy.id,
    port: toxy.port,
    hostname: toxy.host || '*',
    totalRoutes: toxy.routes.length,
    totalPoisons: toxy.getPoisons().length,
    totalRules: toxy.getRules().length
  }

  server.links = {
    self: { href: href },
    routes: { href: href + '/routes' },
    poisons: { href: href + '/poisons' },
    rules: { href: href + '/rules' },
    parent: { href: '/servers' }
  }

  return server
}

function fullServer(req) {
  var data = server(req.toxy)
  data.routes = routes.routes(req)
  data.poisons = directives.poisons(req)
  data.rules = directives.rules(req)
  return data
}
