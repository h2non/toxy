const router = require('router')
const createServer = require('./server')
const randomId = require('../common').randomId

module.exports = Admin

function Admin(toxy, opts) {
  this.stack = []
  this.toxy = toxy
  this.opts = opts || {}
  this.router = router()
}

Admin.prototype.listen = function (port) {
  this.opts.port = +port || +this.opts.port || 9000
  this.server = createServer(this.router, this.opts)
  return this
}

Admin.prototype.close = function (cb) {
  if (this.server) {
    this.server.close(cb)
    this.server = null
  }
  return this
}

Admin.prototype.use = function () {
  this.router.use.apply(this.router, arguments)
  return this
}

Admin.prototype.param = function () {
  this.router.param.apply(this.router, arguments)
  return this
}

Admin.prototype.manage = function (toxy) {
  var seed = toxy.host + ':' + toxy.port
  toxy.id = randomId(seed).slice(0, 3)
  this.stack.push(toxy)
  return this
}

Admin.prototype.find = function (toxyId) {
  var stack = this.stack
  for (var i = 0; i < stack.length; i += 1) {
    if (stack[i].id === toxyId) {
      return stack[i]
    }
  }
}

;['get', 'post', 'put', 'patch', 'delete', 'all'].forEach(function (method) {
  Admin.prototype[method] = function () {
    this.router[method].apply(this.router, arguments)
    return this
  }
})
