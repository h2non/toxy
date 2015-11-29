const expect = require('chai').expect
const headers = require('../..').rules.headers

suite('rules#headers', function () {
  test('header present', function (done) {
    var matchHeaders = { 'content-type': true }
    var req = { headers: { 'content-type': 'application/json' } }

    headers(matchHeaders)(req, null, next)

    function next (err, ignore) {
      expect(err).to.be.null
      expect(ignore).to.be.false
      done()
    }
  })

  test('match by string', function (done) {
    var matchHeaders = { 'content-type': 'application/json' }
    var req = { headers: { 'content-type': 'application/json' } }

    headers(matchHeaders)(req, null, next)

    function next (err, ignore) {
      expect(err).to.be.null
      expect(ignore).to.be.false
      done()
    }
  })

  test('match by regexp', function (done) {
    var matchHeaders = { 'content-type': /^application/i }
    var req = { headers: { 'content-type': 'application/json' } }

    headers(matchHeaders)(req, null, next)

    function next (err, ignore) {
      expect(err).to.be.null
      expect(ignore).to.be.false
      done()
    }
  })

  test('match by function', function (done) {
    var matchHeaders = { 'content-type': match }
    var req = { headers: { 'content-type': 'application/json' } }

    function match (value, key) {
      return key === 'content-type' && value === 'application/json'
    }

    headers(matchHeaders)(req, null, next)

    function next (err, ignore) {
      expect(err).to.be.null
      expect(ignore).to.be.false
      done()
    }
  })

  test('multiple headers', function (done) {
    var matchHeaders = { 'content-type': /^application/i, 'server': true }
    var req = { headers: { 'content-type': 'application/json', 'server': 'rocky' } }

    headers(matchHeaders)(req, null, next)

    function next (err, ignore) {
      expect(err).to.be.null
      expect(ignore).to.be.false
      done()
    }
  })

  test('not present', function (done) {
    var matchHeaders = { 'content-type': false }
    var req = { headers: {} }

    headers(matchHeaders)(req, null, next)

    function next (err, ignore) {
      expect(err).to.be.null
      expect(ignore).to.be.false
      done()
    }
  })

  test('cannot match', function (done) {
    var matchHeaders = { 'empty': true }
    var req = { headers: {} }

    headers(matchHeaders)(req, null, next)

    function next (err, ignore) {
      expect(err).to.be.null
      expect(ignore).to.be.true
      done()
    }
  })
})
