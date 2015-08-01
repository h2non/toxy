const expect = require('chai').expect
const matchHeaders = require('../..').rules.matchHeaders

suite('rules#matchHeaders', function () {
  test('header present', function (done) {
    var headers = { 'content-type': true }
    var req = { headers: { 'content-type': 'application/json' } }

    matchHeaders(headers)(req, null, next)

    function next(ignore) {
      expect(ignore).to.be.false
      done()
    }
  })

  test('match by string', function (done) {
    var headers = { 'content-type': 'application/json' }
    var req = { headers: { 'content-type': 'application/json' } }

    matchHeaders(headers)(req, null, next)

    function next(ignore) {
      expect(ignore).to.be.false
      done()
    }
  })

  test('match by regexp', function (done) {
    var headers = { 'content-type': /^application/i }
    var req = { headers: { 'content-type': 'application/json' } }

    matchHeaders(headers)(req, null, next)

    function next(ignore) {
      expect(ignore).to.be.false
      done()
    }
  })

  test('match by function', function (done) {
    var headers = { 'content-type': match }
    var req = { headers: { 'content-type': 'application/json' } }

    function match(value, key) {
      return key === 'content-type'
        && value === 'application/json'
    }

    matchHeaders(headers)(req, null, next)

    function next(ignore) {
      expect(ignore).to.be.false
      done()
    }
  })

  test('multiple headers', function (done) {
    var headers = { 'content-type': /^application/i, 'server': true }
    var req = { headers: { 'content-type': 'application/json', 'server': 'rocky' } }

    matchHeaders(headers)(req, null, next)

    function next(ignore) {
      expect(ignore).to.be.false
      done()
    }
  })

  test('not present', function (done) {
    var headers = { 'content-type': false }
    var req = { headers: {} }

    matchHeaders(headers)(req, null, next)

    function next(ignore) {
      expect(ignore).to.be.false
      done()
    }
  })

  test('cannot match', function (done) {
    var headers = { 'empty': true }
    var req = { headers: {} }

    matchHeaders(headers)(req, null, next)

    function next(ignore) {
      expect(ignore).to.be.true
      done()
    }
  })
})
