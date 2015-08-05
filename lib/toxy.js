const midware = require('midware')
const Proxy = require('./proxy')

module.exports = Toxy

function Toxy(opts) {
  Proxy.call(this, opts)
  this._rules = midware()
  this._poisons = midware()
  this._setup()
}

Toxy.prototype = Object.create(Proxy.prototype)

Toxy.prototype._setup = function () {
  wrapRouteConstructor(this)
  setupMiddleware(this)
}

function wrapRouteConstructor(self) {
  var _route = self.route
  self.route = function (method, path) {
    var route = _route.apply(self, arguments)
    route._rules = midware()
    route._poisons = midware()
    setupMiddleware(route)
    reDispatchRoute(route)
    return route
  }
}

function reDispatchRoute(route) {
  // Re-dispatch the HTTP request if reaches the final handler!
  route.use(function (req, res, next) {
    route.dispatcher.doDispatch(req, res, function () {})
  })
}

function setupMiddleware(self) {
  self.use(function (req, res, next) {
    // Expose the toxy instance via the middleware
    req.toxy = self

    // Run rules middleware validations before apply the poisons
    self._rules.run(req, res, runPoisons)

    function runPoisons(err, filter) {
      if (err) return next(err)
      if (filter === true) return next()
      self._poisons.run(req, res, next)
    }
  })
}
