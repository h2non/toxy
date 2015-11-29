const http = require('http')
const sinon = require('sinon')
const expect = require('chai').expect
const toxy = require('..')
const supertest = require('supertest')

suite('toxy', function () {
  test('public static members', function () {
    expect(toxy.rules).to.be.an('object')
    expect(toxy.poisons).to.be.an('object')
    expect(toxy.Directive).to.be.a('function')
    expect(toxy.Poison).to.be.a('function')
    expect(toxy.Rule).to.be.a('function')
    expect(toxy.Rocky).to.be.a('function')
    expect(toxy.admin).to.be.a('function')
    expect(toxy.VERSION).to.be.a('string')
  })

  test('use poison', function (done) {
    var proxy = toxy()
    var spy = sinon.spy()

    proxy.poison(function delay (req, res, next) {
      spy(req, res)
      setTimeout(next, 5)
    })

    expect(proxy.isEnabled('delay')).to.be.true
    proxy.disable('delay')
    expect(proxy.isEnabled('delay')).to.be.false
    proxy.enable('delay')
    expect(proxy.isEnabled('delay')).to.be.true

    proxy._inPoisons.run(null, null, function () {
      expect(spy.calledOnce).to.be.true
      done()
    })
  })

  test('use poison phases', function (done) {
    var proxy = toxy()
    var spy = sinon.spy()
    var reqStub = { socket: {}, once: function () {} }

    proxy.poison(function delay (req, res, next) {
      spy(req, res)
      next()
    })

    proxy.outgoingPoison(function delay (req, res, next) {
      spy(req, res)
      next()
    })

    expect(proxy.isEnabled('delay')).to.be.true
    proxy.disable('delay')
    expect(proxy.isEnabled('delay')).to.be.false
    expect(proxy.isEnabledOutgoing('delay')).to.be.true
    proxy.enable('delay')
    expect(proxy.isEnabled('delay')).to.be.true
    proxy.disableOutgoing('delay')
    expect(proxy.isEnabled('delay')).to.be.true
    expect(proxy.isEnabledOutgoing('delay')).to.be.false
    proxy.enableOutgoing('delay')

    proxy._inPoisons.run(reqStub, {}, function () {
      expect(spy.calledOnce).to.be.true
    })

    proxy._outPoisons.run(reqStub, {}, function () {
      expect(spy.calledTwice).to.be.true

      proxy.remove('delay')
      expect(proxy.isEnabled('delay')).to.be.false
      expect(proxy.isEnabledOutgoing('delay')).to.be.true

      proxy.removeOutgoing('delay')
      expect(proxy.isEnabled('delay')).to.be.false
      expect(proxy.isEnabledOutgoing('delay')).to.be.false

      done()
    })
  })

  test('use rule', function (done) {
    var proxy = toxy()
    var called = false

    proxy.rule(function delay (req, res, next) {
      called = true
      setTimeout(next, 5)
    })

    expect(proxy.isRuleEnabled('delay')).to.be.true
    proxy.disableRule('delay')
    expect(proxy.isRuleEnabled('delay')).to.be.false
    proxy.enableRule('delay')
    expect(proxy.isRuleEnabled('delay')).to.be.true

    proxy._rules.run(null, null, function () {
      expect(called).to.be.true
      done()
    })
  })

  test('add custom directives', function () {
    function testPoison () {}
    toxy.addPoison(testPoison)
    expect(toxy.poisons.testPoison).to.be.equal(testPoison)

    function testRule () {}
    toxy.addRule(testRule)
    expect(toxy.rules.testRule).to.be.equal(testRule)

    function testRule () {}
    toxy.addRule('nameRule', testRule)
    expect(toxy.rules.nameRule).to.be.equal(testRule)

    function errorType () { toxy.addRule(null) }
    expect(errorType).to.throw(/Directive must be a function/i)

    function errorName () { toxy.addRule(function () {}) }
    expect(errorName).to.throw(/Directive function must have a name/i)
  })

  test('get directives', function () {
    var proxy = toxy()
    var called = false

    proxy.poison(function delay () {})
    proxy.rule(function match () {})

    expect(proxy.isEnabled('delay')).to.be.true
    expect(proxy.isRuleEnabled('match')).to.be.true

    var poison = proxy.getPoison('delay')
    expect(poison).to.be.an('object')
    expect(poison.isEnabled()).to.be.true
    poison.disable()
    expect(poison.isEnabled()).to.be.false

    var rule = proxy.getRule('match')
    expect(rule).to.be.an('object')
    expect(rule.isEnabled()).to.be.true
    rule.disable()
    expect(rule.isEnabled()).to.be.false
  })

  test('flush directives', function () {
    var proxy = toxy()
    var called = false

    proxy.poison(function delay () {})
    proxy.rule(function match () {})

    expect(proxy.isEnabled('delay')).to.be.true
    expect(proxy.isRuleEnabled('match')).to.be.true

    proxy.flush()
    expect(proxy.isEnabled('delay')).to.be.false
    expect(proxy.getPoison('delay')).to.be.null
    expect(proxy.getPoisons()).to.have.length(0)

    proxy.flushRules()
    expect(proxy.isRuleEnabled('match')).to.be.false
    expect(proxy.getRule('match')).to.be.null
    expect(proxy.getRules()).to.have.length(0)
  })

  test('basic proxy with poisons', function (done) {
    var proxy = toxy()
    var spy = sinon.spy()
    var server = createServer(9081, 200)
    var timeout = 100

    proxy.poison(function delay (req, res, next) {
      spy(req, res)
      setTimeout(next, timeout)
    })

    proxy.rule(function method (req, res, next) {
      spy(req, res)
      next(null, req.method !== 'GET')
    })

    proxy.forward('http://localhost:9081')
    proxy.get('/foo')
    proxy.listen(9080)

    var init = Date.now()
    supertest('http://localhost:9080')
      .get('/foo')
      .expect(200)
      .expect('Content-Type', 'application/json')
      .expect({ hello: 'world' })
      .end(assert)

    function assert (err) {
      expect(Date.now() - init).to.be.at.least(timeout - 1)
      expect(spy.calledTwice).to.be.true

      var req = spy.args[0][0]
      expect(req.url).to.be.equal('/foo')
      expect(req.method).to.be.equal('GET')

      server.close()
      proxy.close(done)
    }
  })

  test('proxy with outgoing poisons', function (done) {
    var proxy = toxy()
    var spy = sinon.spy()
    var server = createServer(9081, 200)
    var timeout = 100

    proxy.outgoingPoison(function delay (req, res, next) {
      spy(req, res)
      setTimeout(next, timeout)
    })

    proxy.outgoingPoison(function capture (req, res, next) {
      spy(req, res)
      next()
    })

    proxy.rule(function method (req, res, next) {
      spy(req, res)
      next(null, req.method !== 'GET')
    })

    proxy.forward('http://localhost:9081')
    proxy.get('/foo')
    proxy.listen(9080)

    var init = Date.now()
    supertest('http://localhost:9080')
      .get('/foo')
      .expect(200)
      .expect('Content-Type', 'application/json')
      .expect({ hello: 'world' })
      .end(assert)

    function assert (err) {
      expect(Date.now() - init).to.be.at.least(timeout - 1)
      expect(spy.calledThrice).to.be.true

      var req = spy.args[0][0]
      expect(req.url).to.be.equal('/foo')
      expect(req.method).to.be.equal('GET')

      var res = spy.args[0][1]
      expect(res.getHeader('server')).to.be.deep.equal('rocky')
      expect(res._originalBody.toString()).to.be.deep.equal('{"hello":"world"}')
      expect(res.body.toString()).to.be.deep.equal('{"hello":"world"}')

      server.close()
      proxy.close(done)
    }
  })

  test('final route handler when no matches', function (done) {
    var proxy = toxy()
    var spy = sinon.spy()
    var server = createServer(9081, 200)
    var timeout = 100

    proxy.poison(function delay (req, res, next) {
      throw 'Should not be called'
    })

    proxy.rule(function method (req, res, next) {
      spy(req, res)
      next(null, true)
    })

    proxy.forward('http://localhost:9081')
    proxy.get('/foo')
    proxy.listen(9080)

    var init = Date.now()
    supertest('http://localhost:9080')
      .get('/foo')
      .expect(200)
      .expect('Content-Type', 'application/json')
      .expect({ hello: 'world' })
      .end(assert)

    function assert (err) {
      expect(spy.calledOnce).to.be.true
      var req = spy.args[0][0]
      expect(req.url).to.be.equal('/foo')
      expect(req.method).to.be.equal('GET')
      done(err)
    }
  })
})

function createServer (port, code, assert) {
  var server = http.createServer(function (req, res) {
    res.writeHead(code, { 'Content-Type': 'application/json' })
    res.write(JSON.stringify({ 'hello': 'world' }))

    var body = ''
    req.on('data', function (data) {
      body += data
    })
    req.on('end', function () {
      req.body = body
      end()
    })

    function end () {
      if (assert) assert(req, res)
      res.end()
    }
  })

  server.listen(port)
  return server
}
