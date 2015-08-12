const toxy = require('../..')
const expect = require('chai').expect
const supertest = require('supertest')

suite('admin#server', function () {
  const proxy = toxy()
  const admin = toxy.admin()
  const ports = { proxy: 9898, admin: 9899 }
  const adminUrl = 'http://localhost:' + ports.admin

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
  admin.listen(ports.admin)

  after(function (done) {
    proxy.close(function () {
      admin.close(done)
    })
  })

  test('root', function (done) {
    supertest(adminUrl)
      .get('/')
      .expect(200)
      .expect('Content-Type', 'application/json')
      .expect(function (res) {
        expect(res.body.version).to.be.equal(toxy.VERSION)
        expect(res.body._links).to.be.an('object')
        expect(res.body._links.self).to.be.deep.equal({ href: '/' })
        expect(res.body._links.servers).to.be.deep.equal({ href: '/servers' })
      })
      .end(done)
  })

  function assertServer(server) {
    expect(server.id).to.be.equal('bcc')
    expect(server.port).to.be.equal(ports.proxy)
    expect(server.poisons).to.have.length(2)
    expect(server.rules).to.have.length(2)
    expect(server._links).to.be.an('object')
    expect(server._links.self).to.be.deep.equal({ href: '/servers/' + server.id })
    expect(server._links.routes).to.be.deep.equal({ href: '/servers/' + server.id + '/routes' })
    expect(server._links.parent).to.be.deep.equal({ href: '/servers' })
  }

  test('GET /servers', function (done) {
    supertest(adminUrl)
      .get('/servers')
      .expect(200)
      .expect(function (res) {
        expect(res.body).to.be.have.length(1)
        var server = res.body.shift()
        assertServer(server)
      })
      .end(done)
  })

  test('GET /servers/:id', function (done) {
    supertest(adminUrl)
      .get('/servers/bcc')
      .expect(200)
      .expect(function (res) {
        assertServer(res.body)
      })
      .end(done)
  })

  test('GET /servers/:id/poisons', function (done) {
    var path = '/servers/bcc/poisons'
    supertest(adminUrl)
      .get(path)
      .expect(200)
      .expect(function (res) {
        expect(res.body).to.have.length(2)
        assertDirective(res.body.shift(), path + '/foo')
      })
      .end(done)
  })

  test('GET /servers/:id/rules', function (done) {
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

  function assertRoute(route) {
    expect(route.id).to.have.length(3)
    expect(route.path).to.have.length(4)
    expect(route.method).to.be.equal('GET')

    expect(route._links).to.be.an('object')
    expect(route._links.self).to.be.deep.equal({ href: '/servers/bcc/routes/' + route.id })
    expect(route._links.poisons).to.be.deep.equal({ href: '/servers/bcc/routes/' + route.id + '/poisons' })
    expect(route._links.rules).to.be.deep.equal({ href: '/servers/bcc/routes/' + route.id + '/rules' })
    expect(route._links.parent).to.be.deep.equal({ href: '/servers/bcc/routes' })
  }

  test('GET /servers/:id/routes', function (done) {
    supertest(adminUrl)
      .get('/servers/bcc/routes')
      .expect(200)
      .expect(function (res) {
        expect(res.body).to.be.have.length(2)
        res.body.forEach(assertRoute)
      })
      .end(done)
  })

  test('GET /servers/:id/routes/:id', function (done) {
    supertest(adminUrl)
      .get('/servers/bcc/routes/32f')
      .expect(200)
      .expect(function (res) {
        expect(res.body.id).to.be.equal('32f')
        assertRoute(res.body)
      })
      .end(done)
  })

  function assertDirective(directive, path) {
    expect(directive.name).to.be.equal('foo')
    expect(directive.enabled).to.be.true
    expect(directive._links).to.be.an('object')
    expect(directive._links.self).to.be.deep.equal({ href: path })
    expect(directive._links.parent).to.be.deep.equal({ href: parentHref(path) })
  }

  test('GET /servers/:id/routes/:id/poisons', function (done) {
    var path = '/servers/bcc/routes/32f/poisons'
    supertest(adminUrl)
      .get(path)
      .expect(200)
      .expect(function (res) {
        expect(res.body).to.have.length(1)
        var poison = res.body[0]
        assertDirective(poison, path + '/foo')
      })
      .end(done)
  })

  test('GET /servers/:id/routes/:id/poisons/:name', function (done) {
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

  test('GET /servers/:id/routes/:id/poisons/:name/rules', function (done) {
    var path = '/servers/bcc/routes/32f/poisons/foo/rules'
    supertest(adminUrl)
      .get(path)
      .expect(200)
      .expect(function (res) {
        expect(res.body).to.have.length(1)
        var rule = res.body.shift()
        assertDirective(rule, path + '/foo')
      })
      .end(done)
  })

  test('GET /servers/:id/routes/:id/poisons/:name/rules/foo', function (done) {
    var path = '/servers/bcc/routes/32f/poisons/foo/rules/foo'
    supertest(adminUrl)
      .get(path)
      .expect(200)
      .expect(function (res) {
        assertDirective(res.body, path)
      })
      .end(done)
  })

  test('GET /servers/:id/routes/:id/rules', function (done) {
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

  test('GET /servers/:id/routes/:id/rules/:name', function (done) {
    var path = '/servers/bcc/routes/32f/rules/foo'
    supertest(adminUrl)
      .get(path)
      .expect(200)
      .expect(function (res) {
        assertDirective(res.body, path)
      })
      .end(done)
  })

})

function parentHref(path) {
  return path.split('/').slice(0, -1).join('/')
}
