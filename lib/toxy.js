const midware = require('midware')
const Proxy = require('./proxy')
const rules = require('./rules')
const poisons = require('./poisons')
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

  opts = Object.assign({}, Toxy.defaults, opts)
  Proxy.call(this, opts)

  this.routes = []
  this._rules = midware()
  this._inPoisons = midware()
  this._outPoisons = midware()

  setupMiddleware(this)
}

/**
 * Defines default rocky proxy options.
 *
 * @property {Object} defaults
 * @static
 */

Toxy.defaults = { changeOrigin: true }

/**
 * Default TCP port to listen.
 *
 * @property {Number} PORT
 * @static
 */

Toxy.PORT = +process.env.PORT || 3000

Toxy.prototype = Object.create(Proxy.prototype)

/**
 * Starts listening on the network in the given port and host.
 *
 * @param {Number} port
 * @param {String} host
 * @method listen
 */

Toxy.prototype.listen = function (port, host) {
  this.host = host
  this.port = +port || Toxy.PORT
  Proxy.prototype.listen.call(this, this.port, host)
  return this
}

/**
 * Registers a new route in the proxy server.
 *
 * @param {String} method
 * @param {String} path
 * @return {Route}
 * @method route
 */

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

/**
 * Finds and returns an already registered route in the router stack.
 *
 * @param {String} routeId
 * @param {String} method
 * @return {Route}
 * @method findRoute
 */

Toxy.prototype.findRoute = function (routeId, method) {
  if (method) routeId = randomId(method, routeId)

  const routes = this.routes.filter(function (route) {
    return route.unregistered !== true
  }).filter(function (route) {
    return route.id === routeId
  })

  return routes.shift()
}

/**
 * Expose built-in poisons.
 *
 * @property {Object} poisons
 */

Toxy.prototype.poisons = Object.create(null)

poisons.forEach(function (poison) {
  Toxy.prototype.poisons[poison.name] = function () {
    return poison.apply(null, arguments)
  }
})

/**
 * Expose built-in rules.
 *
 * @property {Object} rules
 */

Toxy.prototype.rules = Object.create(null)

rules.forEach(function (rule) {
  Toxy.prototype.rules[rule.name] = function () {
    return rule.apply(null, arguments)
  }
})

/**
 * Private helpers
 */

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
