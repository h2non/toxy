const toxy = require('../..')
const expect = require('chai').expect
const supertest = require('supertest')

suite('admin server', function () {
  var proxy = null
  const admin = toxy.admin()
  const ports = { proxy: 9898, admin: 9899 }
  const adminUrl = 'http://localhost:' + ports.admin

  admin.listen(ports.admin)

  function setup() {
    proxy = toxy()

    proxy
      .poison(function foo(req, res, next) { next() })
      .poison(function bar(req, res, next) { next() })
      .withRule(function bar(req, res, next) { next() })

    proxy
      .rule(function foo(req, res, next) { next() })
      .rule(function bar(req, res, next) { next() })

    proxy
      .get('/foo')
      .rule(function foo(req, res, next) { next() })
      .poison(function foo(req, res, next) { next() })
      .withRule(function foo(req, res, next) { next() })

    proxy
      .get('/bar')
      .rule(function bar(req, res, next) { next() })
      .poison(function bar(req, res, next) { next() })

    admin.manage(proxy)
    proxy.listen(ports.proxy)
  }

  function shutdown(done) {
    proxy.close(done)
  }

  test('root', function (done) {
    supertest(adminUrl)
      .get('/')
      .expect(200)
      .expect('Content-Type', 'application/json')
      .expect(function (res) {
        expect(res.body.version).to.be.equal(toxy.VERSION)
        expect(res.body.links).to.be.an('object')
        expect(res.body.links.self).to.be.deep.equal({ href: '/' })
        expect(res.body.links.servers).to.be.deep.equal({ href: '/servers' })
      })
      .end(done)
  })

  function assertServer(server) {
    expect(server.id).to.be.equal('bcc')
    expect(server.port).to.be.equal(ports.proxy)
    expect(server.totalPoisons).to.be.equal(2)
    expect(server.totalRules).to.be.equal(2)
    expect(server.totalRoutes).to.be.equal(2)
    expect(server.links).to.be.an('object')
    expect(server.links.self).to.be.deep.equal({ href: '/servers/' + server.id })
    expect(server.links.routes).to.be.deep.equal({ href: '/servers/' + server.id + '/routes' })
    expect(server.links.parent).to.be.deep.equal({ href: '/servers' })
  }

  suite('servers', function () {
    test('setup', setup)

    test('get servers', function (done) {
      supertest(adminUrl)
        .get('/servers')
        .expect(200)
        .expect(function (res) {
          res.body.forEach(assertServer)
        })
        .end(done)
    })

    test('get server', function (done) {
      supertest(adminUrl)
        .get('/servers/bcc')
        .expect(200)
        .expect(function (res) {
          assertServer(res.body)
          expect(res.body.routes).to.have.length(2)
        })
        .end(done)
    })

    test('delete server', function (done) {
      supertest(adminUrl)
        .delete('/servers/bcc')
        .expect(204)
        .end(done)
    })

    test('reset', shutdown)
  })

  function assertDirective(directive, path) {
    expect(directive.name).to.be.a('string')
    expect(directive.enabled).to.be.true
    expect(directive.links).to.be.an('object')
    expect(directive.links.self).to.be.deep.equal({ href: path })
    expect(directive.links.parent).to.be.deep.equal({ href: parentHref(path) })
  }

  suite('server poisons', function () {
    test('setup', setup)

    test('all', function (done) {
      var path = '/servers/bcc/poisons'
      supertest(adminUrl)
        .get(path)
        .expect(200)
        .expect(function (res) {
          expect(res.body).to.have.length(2)
          res.body.forEach(function (directive) {
            assertDirective(directive, path + '/' + directive.name)
          })

        })
        .end(done)
    })

    test('delete by name', function (done) {
      var path = '/servers/bcc/poisons/foo'
      supertest(adminUrl)
        .delete(path)
        .expect(204)
        .end(done)
    })

    test('create', function (done) {
      var path = '/servers/bcc/poisons'
      supertest(adminUrl)
        .post(path)
        .send({ name: 'latency', options: { jitter: 1000 } })
        .expect(201)
        .end(done)
    })

    test('cannot create invalid poison', function (done) {
      var path = '/servers/bcc/poisons'
      supertest(adminUrl)
        .post(path)
        .send({ name: 'invalid' })
        .expect(404)
        .end(done)
    })

    test('get by name', function (done) {
      var path = '/servers/bcc/poisons/latency'
      supertest(adminUrl)
        .get(path)
        .expect(200)
        .expect(function (res) {
          assertDirective(res.body, path)
        })
        .end(done)
    })

    test('delete all', function (done) {
      var path = '/servers/bcc/poisons'
      supertest(adminUrl)
        .delete(path)
        .expect(204)
        .end(done)
    })

    test('reset', shutdown)
  })

  suite('server rules', function () {
    test('setup', setup)

    test('all', function (done) {
      var path = '/servers/bcc/rules'
      supertest(adminUrl)
        .get(path)
        .expect(200)
        .expect(function (res) {
          expect(res.body).to.have.length(2)
          assertDirective(res.body.shift(), path + '/foo')
        })
        .end(done)
    })

    test('delete by name', function (done) {
      var path = '/servers/bcc/rules/foo'
      supertest(adminUrl)
        .delete(path)
        .expect(204)
        .end(done)
    })

    test('create', function (done) {
      var path = '/servers/bcc/rules'
      supertest(adminUrl)
        .post(path)
        .send({ name: 'method', options: 'GET' })
        .expect(201)
        .end(done)
    })

    test('get by name', function (done) {
      var path = '/servers/bcc/rules/method'
      supertest(adminUrl)
        .get(path)
        .expect(200)
        .expect(function (res) {
          assertDirective(res.body, path)
        })
        .end(done)
    })

    test('reset', shutdown)
  })

  function assertRoute(route, path) {
    expect(route.id).to.have.length(3)
    expect(route.path).to.be.a('string')
    expect(route.method).to.be.equal('GET')
    expect(route.links).to.be.an('object')
    expect(route.links.self).to.be.deep.equal({ href: '/servers/bcc/routes/' + route.id })
    expect(route.links.poisons).to.be.deep.equal({ href: '/servers/bcc/routes/' + route.id + '/poisons' })
    expect(route.links.rules).to.be.deep.equal({ href: '/servers/bcc/routes/' + route.id + '/rules' })
    expect(route.links.parent).to.be.deep.equal({ href: '/servers/bcc/routes' })
  }

  suite('routes', function () {
    test('setup', setup)

    test('all', function (done) {
      supertest(adminUrl)
        .get('/servers/bcc/routes')
        .expect(200)
        .expect(function (res) {
          expect(res.body).to.be.have.length(2)
          res.body.forEach(assertRoute)
        })
        .end(done)
    })

    test('delete by id', function (done) {
      supertest(adminUrl)
        .delete('/servers/bcc/routes/32f')
        .expect(204)
        .end(done)
    })

    test('create', function (done) {
      supertest(adminUrl)
        .post('/servers/bcc/routes')
        .send({ path: '/foobar', method: 'GET', forward: 'http://localhost:8080' })
        .expect(201)
        .end(done)
    })

    test('get by id', function (done) {
      supertest(adminUrl)
        .get('/servers/bcc/routes/464')
        .expect(200)
        .expect(function (res) {
          expect(res.body.id).to.be.equal('464')
          assertRoute(res.body, '/foobar')
        })
        .end(done)
    })

    test('delete all', function (done) {
      supertest(adminUrl)
        .delete('/servers/bcc/routes')
        .expect(204)
        .end(done)
    })

    test('check empty routes', function (done) {
      supertest(adminUrl)
        .get('/servers/bcc/routes')
        .expect(200)
        .expect([])
        .end(done)
    })

    test('reset', shutdown)
  })

  suite('route poisons', function () {
    test('setup', setup)

    test('all', function (done) {
      var path = '/servers/bcc/routes/32f/poisons'
      supertest(adminUrl)
        .get(path)
        .expect(200)
        .expect(function (res) {
          expect(res.body).to.have.length(1)
          assertDirective(res.body.shift(), path + '/foo')
        })
        .end(done)
    })

    test('get by name', function (done) {
      var path = '/servers/bcc/routes/32f/poisons/foo'
      supertest(adminUrl)
        .get(path)
        .expect(200)
        .expect(function (res) {
          assertDirective(res.body, path)
          expect(res.body.rules).to.have.length(1)
          var nestedRule = res.body.rules.shift()
          assertDirective(nestedRule, path + '/rules/foo')
        })
        .end(done)
    })

    test('delete by name', function (done) {
      var path = '/servers/bcc/routes/32f/poisons/foo'
      supertest(adminUrl)
        .delete(path)
        .expect(204)
        .end(done)
    })

    test('delete all', function (done) {
      var path = '/servers/bcc/routes/32f/poisons'
      supertest(adminUrl)
        .delete(path)
        .expect(204)
        .end(done)
    })

    test('reset', shutdown)
  })

  suite('route poison rules', function () {
    test('setup', setup)

    test('get all', function (done) {
      var path = '/servers/bcc/routes/32f/poisons/foo/rules'
      supertest(adminUrl)
        .get(path)
        .expect(200)
        .expect(function (res) {
          expect(res.body).to.have.length(1)
          assertDirective(res.body.shift(), path + '/foo')
        })
        .end(done)
    })

    test('get by name', function (done) {
      var path = '/servers/bcc/routes/32f/poisons/foo/rules/foo'
      supertest(adminUrl)
        .get(path)
        .expect(200)
        .expect(function (res) {
          assertDirective(res.body, path)
        })
        .end(done)
    })

    test('delete by name', function (done) {
      var path = '/servers/bcc/routes/32f/poisons/foo/rules/foo'
      supertest(adminUrl)
        .delete(path)
        .expect(204)
        .end(done)
    })

    test('delete all', function (done) {
      var path = '/servers/bcc/routes/32f/poisons/foo/rules'
      supertest(adminUrl)
        .delete(path)
        .expect(204)
        .end(done)
    })

    test('reset', shutdown)
  })

  suite('route rules', function () {
    test('setup', setup)

    test('get all', function (done) {
      var path = '/servers/bcc/routes/32f/rules'
      supertest(adminUrl)
        .get(path)
        .expect(200)
        .expect(function (res) {
          expect(res.body).to.have.length(1)
          var rule = res.body[0]
          assertDirective(rule, path + '/foo')
        })
        .end(done)
    })

    test('get by name', function (done) {
      var path = '/servers/bcc/routes/32f/rules/foo'
      supertest(adminUrl)
        .get(path)
        .expect(200)
        .expect(function (res) {
          assertDirective(res.body, path)
        })
        .end(done)
    })

    test('delete by name', function (done) {
      var path = '/servers/bcc/routes/32f/rules/foo'
      supertest(adminUrl)
        .delete(path)
        .expect(204)
        .end(done)
    })

    test('delete all', function (done) {
      var path = '/servers/bcc/routes/32f/rules'
      supertest(adminUrl)
        .delete(path)
        .expect(204)
        .end(done)
    })

    test('reset', shutdown)
  })

})

function parentHref(path) {
  return path.split('/').slice(0, -1).join('/')
}
