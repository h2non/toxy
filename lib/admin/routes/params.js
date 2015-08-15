exports.serverParam = function (req, res, next, serverId) {
  req.toxy = req.admin.find(serverId)
  req.href = '/servers/' + serverId
  if (req.toxy) return next()
  notFound(res)
}

exports.ruleParam = function (req, res, next, ruleId) {
  var toxy = req.toxyPoison || req.toxyRoute || req.toxy
  req.toxyRule = toxy.getRule(ruleId)
  req.href += '/rules/' + ruleId
  if (req.toxyRule) return next()
   notFound(res)
}

exports.poisonParam = function (req, res, next, poisonId) {
  var toxy = req.toxyRoute || req.toxy
  req.toxyPoison = toxy.getPoison(poisonId)
  req.href += '/poisons/' + poisonId
  if (req.toxyPoison) return next()
  notFound(res)
}

exports.routeParam = function (req, res, next, routeId) {
  var routes = req.toxy.routes
  req.href += '/routes/' + routeId

  for (var i = 0; i < routes.length; i += 1) {
    if (routes[i].id === routeId && routes[i].unregistered !== true) {
      req.toxyRoute = routes[i]
      return next()
    }
  }

  notFound(res)
}

function notFound(res) {
  res.writeHead(404, { 'Content-Type': 'application/json'})
  res.end('{"message":"Not found"}')
}
