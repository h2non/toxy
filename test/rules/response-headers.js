const expect = require('chai').expect
const headers = require('../..').rules.responseHeaders

suite('rules#responseHeaders', function () {
  test('header present', function (done) {
    var matchHeaders = { 'content-type': true }
    var res = { headers: { 'content-type': 'application/json' } }

    headers(matchHeaders)(null, res, next)

    function next(err, ignore) {
      expect(err).to.be.null
      expect(ignore).to.be.false
      done()
    }
  })

  test('match by string', function (done) {
    var matchHeaders = { 'content-type': 'application/json' }
    var res = { headers: { 'content-type': 'application/json' } }

    headers(matchHeaders)(null, res, next)

    function next(err, ignore) {
      expect(err).to.be.null
      expect(ignore).to.be.false
      done()
    }
  })

  test('match by regexp', function (done) {
    var matchHeaders = { 'content-type': /^application/i }
    var res = { headers: { 'content-type': 'application/json' } }

    headers(matchHeaders)(null, res, next)

    function next(err, ignore) {
      expect(err).to.be.null
      expect(ignore).to.be.false
      done()
    }
  })

  test('match by function', function (done) {
    var matchHeaders = { 'content-type': match }
    var res = { headers: { 'content-type': 'application/json' } }

    function match(value, key) {
      return key === 'content-type'
        && value === 'application/json'
    }

    headers(matchHeaders)(null, res, next)

    function next(err, ignore) {
      expect(err).to.be.null
      expect(ignore).to.be.false
      done()
    }
  })

  test('multiple headers', function (done) {
    var matchHeaders = { 'content-type': /^application/i, 'server': true }
    var res = { headers: { 'content-type': 'application/json', 'server': 'rocky' } }

    headers(matchHeaders)(null, res, next)

    function next(err, ignore) {
      expect(err).to.be.null
      expect(ignore).to.be.false
      done()
    }
  })

  test('not present', function (done) {
    var matchHeaders = { 'content-type': false }
    var res = { headers: {} }

    headers(matchHeaders)(null, res, next)

    function next(err, ignore) {
      expect(err).to.be.null
      expect(ignore).to.be.false
      done()
    }
  })

  test('cannot match', function (done) {
    var matchHeaders = { 'empty': true }
    var res = { headers: {} }

    headers(matchHeaders)(null, res, next)

    function next(err, ignore) {
      expect(err).to.be.null
      expect(ignore).to.be.true
      done()
    }
  })
})
