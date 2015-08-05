const expect = require('chai').expect
const method = require('../..').rules.method

suite('rules#method', function () {
  test('match', function (done) {
    var match = 'GET'
    var req = { method: 'GET' }

    method(match)(req, null, next)

    function next(err, ignore) {
      expect(err).to.be.null
      expect(ignore).to.be.false
      done()
    }
  })

  test('multiple methods', function (done) {
    var match = 'GET'
    var req = { method: 'GET' }

    method(['POST', 'GET'])(req, null, next)

    function next(err, ignore) {
      expect(err).to.be.null
      expect(ignore).to.be.false
      done()
    }
  })

  test('cannot match', function (done) {
    var match = 'POST'
    var req = { method: 'GET' }

    method(match)(req, null, next)

    function next(err, ignore) {
      expect(err).to.be.null
      expect(ignore).to.be.true
      done()
    }
  })
})
