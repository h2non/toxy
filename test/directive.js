const expect = require('chai').expect
const Directive = require('../lib/directive')

suite('directive', function () {
  test('single directive', function (done) {
    var d = new Directive(done)
    d.handler()()
  })

  test('rule', function (done) {
    var d = new Directive(directive)
    var req = {}

    d.rule(rule)
    d.handler()(req, null)

    function directive(req, res, next) {
      expect(req.rule).to.be.true
      done()
    }

    function rule(req, res, next) {
      req.rule = true
      next()
    }
  })

  test('ignore rule', function (done) {
    var d = new Directive(directive)
    var req = {}

    d.rule(rule)
    d.handler()(req, null, done)

    function directive(req, res, next) {
      throw new Error('Directive called')
    }

    function rule(req, res, next) {
      next(null, true)
    }
  })

  test('disable', function (done) {
    var d = new Directive(directive)
    var req = {}

    d.rule(rule)
    d.disable()

    expect(d.isEnabled()).to.be.false
    d.handler()(req, null, done)

    function directive(req, res, next) {
      throw new Error('Directive called')
    }

    function rule(req, res, next) {
      throw new Error('Rule called')
    }
  })

  test('disable rule', function (done) {
    var d = new Directive(directive)
    var req = {}

    d.rule(rule)
    d.disableRule('rule')

    expect(d.isEnabled()).to.be.true
    d.handler()(req, null, done)

    function directive(req, res, next) {
      done()
    }

    function rule(req, res, next) {
      throw new Error('Rule called')
    }
  })
})
