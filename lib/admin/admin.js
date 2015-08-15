const router = require('router')
const createServer = require('./server')
const randomId = require('../common').randomId

module.exports = Admin

function Admin(opts) {
  this.stack = []
  this.opts = opts || {}
  this.router = router(opts)
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
  this.remove(toxy.id)
  this.stack.push(toxy)
  return this
}

Admin.prototype.remove = function (toxy) {
  var stack = this.stack
  var index = find(stack, toxy)
  if (index >= 0) stack.splice(index, 0)
  return !!~index
}

Admin.prototype.middleware = function (req, res, next) {
  this.router(req, res, next)
  return this
}

Admin.prototype.find = function (toxy) {
  var stack = this.stack
  var index = find(stack, toxy)
  return stack[index]
}

function find(stack, toxy) {
  for (var i = 0; i < stack.length; i += 1) {
    if (stack[i].id === toxy || stack[i] === toxy) {
      return i
    }
  }
}

;['get', 'post', 'put', 'patch', 'delete', 'all'].forEach(function (method) {
  Admin.prototype[method] = function () {
    this.router[method].apply(this.router, arguments)
    return this
  }
})
