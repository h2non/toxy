const expect = require('chai').expect
const Poison = require('../lib/poison')

suite('poison', function () {
  test('default', function (done) {
    var p = new Poison(done)
    expect(p.phase).to.be.equal('incoming')
    expect(p._outPoisonsEnabled).to.be.false
    expect(p.isEnabled()).to.be.true
    p.handler()()
  })

  test('state', function (done) {
    var p = new Poison(done)
    expect(p.isEnabled()).to.be.true
    p.disable()
    expect(p.isEnabled()).to.be.false
    p.enable()
    p.handler()()
  })

  test('nested rule', function (done) {
    var p = new Poison(directive)
    var req = {}

    p.rule(rule)
    p.handler()(req, null)

    function directive(req, res, next) {
      expect(req.rule).to.be.true
      done()
    }

    function rule(req, res, next) {
      req.rule = true
      next()
    }
  })
})
