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
  setupMiddleware(this)
  wrapRouteConstructor(this)
}

function wrapRouteConstructor(self) {
  var _route = self.route
  self.route = function (method, path) {
    var route = _route.apply(self, arguments)
    route._rules = midware()
    route._poisons = midware()
    setupMiddleware(route, self)
    return route
  }
}

function setupMiddleware(self) {
  self.use(function (req, res, next) {
    // Expose the toxy instance via the middleware
    req.toxy = self

    // Run rules middleware validations before apply the poisons
    self._rules.run(req, res, function (filter) {
      if (filter === true) return next()
      if (filter) return next(filter)
      self._poisons.run(req, res, next)
    })
  })
}
