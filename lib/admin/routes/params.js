exports.serverParam = function (req, res, next, serverId) {
  req.toxy = req.admin.find(serverId)
  if (!req.toxy) return notFound(res)

  req.href = '/servers/' + serverId
  next()
}

exports.routeParam = function (req, res, next, routeId) {
  var routes = req.toxy.routes

  var route = req.toxy.findRoute(routeId)
  if (!route) return notFound(res)

  req.href += '/routes/' + routeId
  req.toxyRoute = route
  next()
}

exports.ruleParam = function (req, res, next, ruleId) {
  var toxy = req.toxyPoison || req.toxyRoute || req.toxy
  req.toxyRule = toxy.getRule(ruleId)
  if (!req.toxyRule) return notFound(res)

  req.href += '/rules/' + ruleId
  next()
}

exports.poisonParam = function (req, res, next, poisonId) {
  var toxy = req.toxyRoute || req.toxy

  var pair = poisonId.split(':')
  var name = pair.shift()
  var phase = pair.shift() || 'incoming'

  req.toxyPoison = toxy.getPoison(name)
  if (!req.toxyPoison) return notFound(res)

  req.href += '/poisons/' + poisonId
  next()
}

function notFound (res) {
  res.writeHead(404, { 'Content-Type': 'application/json'})
  res.end('{"message":"Not found"}')
}
