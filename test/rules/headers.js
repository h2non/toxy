const expect = require('chai').expect
const headers = require('../..').rules.headers

suite('rules#headers', function () {
  test('header present', function (done) {
    const matchHeaders = { 'content-type': true }
    const req = { headers: { 'content-type': 'application/json' } }

    headers(matchHeaders)(req, null, next)

    function next (err, ignore) {
      expect(err).to.be.null
      expect(ignore).to.be.false
      done()
    }
  })

  test('match by string', function (done) {
    const matchHeaders = { 'content-type': 'application/json' }
    const req = { headers: { 'content-type': 'application/json' } }

    headers(matchHeaders)(req, null, next)

    function next (err, ignore) {
      expect(err).to.be.null
      expect(ignore).to.be.false
      done()
    }
  })

  test('match by regexp', function (done) {
    const matchHeaders = { 'content-type': /^application/i }
    const req = { headers: { 'content-type': 'application/json' } }

    headers(matchHeaders)(req, null, next)

    function next (err, ignore) {
      expect(err).to.be.null
      expect(ignore).to.be.false
      done()
    }
  })

  test('match by function', function (done) {
    const matchHeaders = { 'content-type': match }
    const req = { headers: { 'content-type': 'application/json' } }

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
    const matchHeaders = { 'content-type': /^application/i, 'server': true }
    const req = { headers: { 'content-type': 'application/json', 'server': 'rocky' } }

    headers(matchHeaders)(req, null, next)

    function next (err, ignore) {
      expect(err).to.be.null
      expect(ignore).to.be.false
      done()
    }
  })

  test('not present', function (done) {
    const matchHeaders = { 'content-type': false }
    const req = { headers: {} }

    headers(matchHeaders)(req, null, next)

    function next (err, ignore) {
      expect(err).to.be.null
      expect(ignore).to.be.false
      done()
    }
  })

  test('cannot match', function (done) {
    const matchHeaders = { 'empty': true }
    const req = { headers: {} }

    headers(matchHeaders)(req, null, next)

    function next (err, ignore) {
      expect(err).to.be.null
      expect(ignore).to.be.true
      done()
    }
  })
})
