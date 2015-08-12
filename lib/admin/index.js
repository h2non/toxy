const Admin = require('./admin')
const routes = require('./routes')
const middleware = require('./middleware')
const version = require('../../package.json').version

module.exports = function (opts) {
  var admin = new Admin(opts)

  // Setup router middleware
  middleware(admin)

  // Setup routes
  routes(admin)

  return admin
}
