const directives = require('./directives')
const parentHref = require('./common').parentHref

exports.all = function (req, res) {
  res.reply(exports.routes(req))
}

exports.get = function (req, res) {
  res.reply(fullRoute(req))
}

exports.deleteRoute = function (req, res) {
  req.toxyRoute.unregister()
  res.statusCode = 204
  res.end()
}

exports.delete = function (req, res) {
  var routes = req.toxy.routes

  routes.forEach(function (route) {
    route.unregister()
  })

  res.statusCode = 204
  res.end()
}

exports.routes = function (req) {
  return req.toxy.routes
  .filter(function (route) {
    return route.unregistered !== true
  })
  .map(function (route) {
    return exports.route(req, route)
  })
}

exports.route = function (req, route) {
  route = route || req.toxyRoute

  var href = !~req.href.indexOf('routes')
    ? req.href + '/routes/' + route.id
    : req.href

  var totalPoisons = route.getPoisons().length
  var totalRules = route.getRules().length

  var data = {
    id: route.id,
    path: route.path,
    method: route.method,
    totalPoisons: totalPoisons,
    totalRules: totalRules
  }

  data.links = {
    self: { href: href },
    poisons: { href: href + '/poisons' },
    rules: { href: href + '/rules' },
    parent: { href: parentHref(href) }
  }

  return data
}

exports.create = function (req, res) {
  var toxy = req.toxy
  var body = req.body

  if (!body || !body.path) {
    res.statusCode = 400
    return res.end()
  }

  var path = body.path
  var method = (body.method || 'all').toLowerCase()

  if (!toxy[method]) {
    res.statusCode = 400
    return res.end()
  }

  var route = toxy[method](path)

  if (body.forward) {
    route.forward(body.forward)
  }

  var href = req.href

  var links = {
    self: { href: href },
    poisons: { href: href + '/poisons' },
    rules: { href: href + '/rules' },
    parent: { href: parentHref(href) }
  }

  var data = {
    name: route.id,
    links: links
  }

  res.reply(data, 201)
}

function fullRoute(req, route) {
  var route = exports.route(req, route)
  route.poisons = directives.poisons(req)
  route.rules = directives.rules(req)
  return route
}
