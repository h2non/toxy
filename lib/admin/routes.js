const assign = require('object-assign')
const version = require('../../package.json').version

module.exports = function (admin) {
  admin.param('serverId', serverIdParam)
  admin.param('routeId', routeIdParam)
  admin.param('poisonId', poisonIdParam)
  admin.param('ruleId', ruleIdParam)

  admin.get('/servers/:serverId', function (req, res) {
    reply(res, getServer(req.toxy))
  })
  admin.get('/servers', getServers)

  admin.get('/servers/:serverId/routes', function (req, res) {
    var routes = req.toxy.routes.map(function (route) {
      return getRoute(route, req.toxy)
    })
    reply(res, routes)
  })

  admin.get('/servers/:serverId/routes/:routeId', function (req, res) {
    var routeData = getRoute(req.toxyRoute, req.toxy)
    reply(res, routeData)
  })

  admin.get('/servers/:serverId/routes/:routeId/poisons', function (req, res) {
    var poisons = getMiddlewareStack(req.toxyRoute._poisons, 'poisons', req)
    reply(res, poisons)
  })

  admin.get('/servers/:serverId/routes/:routeId/poisons/:poisonId', getDirective('poison'))
  admin.get('/servers/:serverId/routes/:routeId/poisons/:poisonId/rules', function (req, res) {
    var rules = getMiddlewareStack(req.toxyPoison._rules, 'rules', req)
    reply(res, rules)
  })

  admin.get('/servers/:serverId/routes/:routeId/poisons/:poisonId/rules/:ruleId', getDirective('rule'))

  function getDirective(type) {
    return function (req, res) {
      var href = req.href
      var isPoison = type === 'poison'
      var directive = isPoison ? req.toxyPoison : req.toxyRule

      var body = {
        name: directive.directive.name,
        enabled: directive.isEnabled()
      }

      if (isPoison) {
        body.rules = getMiddlewareStack(directive._rules, 'rules', req)
      }

      body._links = {
        self: { href: href },
        parent: { href: parentHref(href) }
      }

      reply(res, body)
    }
  }

  admin.get('/servers/:serverId/routes/:routeId/rules', function (req, res) {
    var rules = getMiddlewareStack(req.toxyRoute._rules, 'rules', req)
    reply(res, rules)
  })

  admin.get('/servers/:serverId/routes/:routeId/rules/:ruleId', getDirective('rule'))

  admin.get('/servers/:serverId/poisons', function (req, res) {
    var poisons = getMiddlewareStack(req.toxy._poisons, 'poisons', req)
    reply(res, poisons)
  })

  admin.delete('/servers/:serverId/poisons', function (req, res) {
    req.toxy.flush()
    res.statusCode = 204
    res.end()
  })

  admin.delete('/servers/:serverId/rules', function (req, res) {
    req.toxy.flushRules()
    res.statusCode = 204
    res.end()
  })

  admin.get('/servers/:serverId/poisons/:poisonId', function (req, res) {
    var poison = getDirective(req.toxyPoison)
    reply(res, poison)
  })

  admin.delete('/servers/:serverId/poisons/:poisonId', function (req, res) {
    req.toxy.remove(req.params.poisonId)
    res.statusCode = 204
    res.end()
  })

  admin.get('/servers/:serverId/rules', function (req, res) {
    var poisons = getMiddlewareStack(req.toxy._rules, 'rules', req)
    reply(res, poisons)
  })

  admin.get('/servers/:serverId/rules/:ruleId', function (req, res) {
    var poisons = getMiddlewareStack(req.toxy._rules, 'rules', req)
    reply(res, poisons)
  })

  admin.get('/servers/:serverId/rules/:ruleId', function (req, res) {
    var rule = getDirective(req.toxyRule)
    reply(res, rule)
  })

  admin.delete('/servers/:serverId/rules/:ruleId', function (req, res) {
    req.toxy.removeRule(req.params.ruleId)
    res.statusCode = 204
    res.end()
  })

  admin.get('/', function (req, res) {
    res.setHeader('Content-Type', 'application/json')
    reply(res, {
      name: 'toxy admin server',
      version: version,
      _links: {
        self: { href: '/' },
        servers: { href: '/servers' }
      }
    })
  })

  return admin
}

function getServers(req, res, next) {
  var servers = req.admin.stack.map(getServer)
  reply(res, servers)
}

function getServer(toxy) {
  var href = '/servers/' + toxy.id

  return {
    id: toxy.id,
    port: toxy.port,
    hostname: toxy.host,
    routes: getRoutes(toxy),
    poisons: getMiddlewareStack(toxy._poisons, 'poisons', { href: href }),
    rules: getMiddlewareStack(toxy._rules, 'rules', { href: href }),
    _links: {
      self: { href: href },
      routes: { href: href + '/routes' },
      poisons: { href: href + '/poisons' },
      rules: { href: href + '/rules' },
      parent: { href: '/servers' }
    }
  }
}

function getRoutes(toxy) {
  return toxy.routes.map(function (route) {
    var data = getRoute(route, toxy)
    data.poisons = data.poisons.length
    data.rules = data.rules.length
    return data
  })
}

function getRoute(route, toxy) {
  var href = '/servers/' + toxy.id + '/routes/' + route.id
  var poisons = getMiddlewareStack(route._poisons, 'poisons', { href: href })
  var rules = getMiddlewareStack(route._rules, 'rules', { href: href })

  return {
    id: route.id,
    path: route.path,
    method: route.method,
    poisons: poisons,
    rules: rules,
    _links: {
      self: { href: href },
      poisons: { href: href + '/poisons' },
      rules: { href: href + '/rules' },
      parent: { href: parentHref(href) }
    }
  }
}

function getMiddlewareStack(mw, type, req) {
  var href = req.href
  return mw.stack.map(function (directive) {
    var dir = getDirective(directive)
    var nested = href + '/' + type + '/' + directive.$name
    dir._links = {
      self: { href: nested },
      parent: { href: parentHref(nested) }
    }
    return dir
  })
}

function getDirective(directive) {
  return {
    name: directive.$name,
    enabled: directive.$of.isEnabled()
  }
}

function ruleIdParam(req, res, next, ruleId) {
  var toxy = req.toxyRoute || req.toxy
  req.toxyRule = toxy.getRule(ruleId)
  req.href += '/rules/' + ruleId
  if (!req.toxyRule) return notFound(res)
  next()
}

function poisonIdParam(req, res, next, poisonId) {
  var toxy = req.toxyRoute || req.toxy
  req.toxyPoison = toxy.getPoison(poisonId)
  req.href += '/poisons/' + poisonId
  if (!req.toxyPoison) return notFound(res)
  next()
}

function serverIdParam(req, res, next, serverId) {
  req.toxy = req.admin.find(serverId)
  req.href = '/servers/' + serverId
  if (!req.toxy) return notFound(res)
  next()
}

function routeIdParam(req, res, next, routeId) {
  var routes = req.toxy.routes

  for (var i = 0; i < routes.length; i += 1) {
    if (routes[i].id === routeId) {
      req.toxyRoute = routes[i]
      req.href += '/routes/' + routeId
      return next()
    }
  }

  notFound(res)
}

function notFound(res) {
  res.writeHead(404, { 'Content-Type': 'application/json'})
  res.end('{"message":"Resource not found"}')
}

function reply(res, data, code) {
  res.statusCode = +code || 200
  res.setHeader('Content-Type', 'application/json')
  res.end(data ? toJSON(data) : null)
}

function parentHref(href) {
  return href.split('/').slice(0, -1).join('/')
}

function toJSON(data) {
  return JSON.stringify(data)
}
