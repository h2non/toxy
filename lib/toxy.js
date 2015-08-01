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

  var _route = this.route
  this.route = function (method, path) {
    var route = _route.apply(this, arguments)
    route._rules = midware()
    route._poisons = midware()
    setupMiddleware(route)
    return route
  }
}

function setupMiddleware(self) {
  self.use(function (req, res, next) {
    self._rules.run(req, res, function (filter) {
      if (filter === true) return next()
      if (filter) return next(filter)
      self._poisons.run(req, res, next)
    })
  })
}
