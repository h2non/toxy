const midware = require('midware')
const Proxy = require('./proxy')
const randomId = require('./helpers').randomId

module.exports = Toxy

/**
 * Creates a new Toxy HTTP proxy.
 *
 * @param {Object} opts
 * @class Toxy
 * @extends Proxy
 */

function Toxy (opts) {
  if (!(this instanceof Toxy)) return new Toxy(opts)
  Proxy.call(this, opts)

  this.routes = []
  this._rules = midware()
  this._inPoisons = midware()
  this._outPoisons = midware()

  setupMiddleware(this)
}

Toxy.PORT = +process.env.PORT || 3000

Toxy.prototype = Object.create(Proxy.prototype)

Toxy.prototype.listen = function (port, host) {
  this.host = host
  this.port = +port || Toxy.PORT
  Proxy.prototype.listen.call(this, this.port, host)
  return this
}

Toxy.prototype.route = function (method, path) {
  const route = Proxy.prototype.route.apply(this, arguments)

  // Expose toxy route specific data
  route.id = randomId(method, path)
  route.method = method.toUpperCase()

  // Creates toxy specific route-level middleware
  route._rules = midware()
  route._inPoisons = midware()
  route._outPoisons = midware()

  // Register route in the toxy stack
  this.routes.push(route)

  // Setup route middleware and final handler
  setupMiddleware(route)

  // Re-dispatch route if reaches the final handler
  finalHandler(route)

  return route
}

Toxy.prototype.findRoute = function (routeId, method) {
  if (method) routeId = randomId(method, routeId)

  const routes = this.routes.filter(function (route) {
    return route.unregistered !== true
  }).filter(function (route) {
    return route.id === routeId
  })

  return routes.shift()
}

function finalHandler (route) {
  var isFinalHandler = false
  route.use(function (req, res, next) {
    if (!isFinalHandler) {
      isFinalHandler = true
      useRouteFinalHandler(route)
    }
    next()
  })
}

function useRouteFinalHandler (route) {
  route.use(function (req, res, next) {
    route.dispatcher.doDispatch(req, res, noop)
  })
}

function setupMiddleware (self) {
  self.use(function (req, res, next) {
    // Expose the toxy instance via the middleware
    req.toxy = self

    // Run rules middleware validations before apply the poisons
    self._rules.run(req, res, runPoisons)

    function runPoisons (err, filter) {
      if (err) return next(err)
      if (filter === true) return next()
      self._inPoisons.run(req, res, next)
    }
  })
}

function noop () {}
