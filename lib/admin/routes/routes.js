const directives = require('./directives')
const parentHref = require('./helpers').parentHref

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
  const routes = req.toxy.routes

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
  route = route || req.toxyRoute

  const href = !~req.href.indexOf('routes')
    ? req.href + '/routes/' + route.id
    : req.href

  const totalPoisons = route.getPoisons().length
  const totalRules = route.getRules().length

  const data = {
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
  const toxy = req.toxy
  const body = req.body

  if (!body || !body.path) {
    res.statusCode = 400
    return res.end()
  }

  const path = body.path
  const method = (body.method || 'all').toLowerCase()

  if (!toxy[method]) {
    res.statusCode = 400
    return res.end()
  }

  const route = toxy[method](path)

  if (body.forward) {
    route.forward(body.forward)
  }

  const href = req.href

  const links = {
    self: { href: href },
    poisons: { href: href + '/poisons' },
    rules: { href: href + '/rules' },
    parent: { href: parentHref(href) }
  }

  const data = {
    name: route.id,
    links: links
  }

  res.reply(data, 201)
}

function fullRoute (req) {
  const route = exports.route(req)
  route.poisons = directives.poisons(req)
  route.rules = directives.rules(req)
  return route
}
