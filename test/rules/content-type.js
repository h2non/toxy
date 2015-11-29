const expect = require('chai').expect
const contentType = require('../..').rules.contentType

suite('rules#contentType', function () {
  test('string', function (done) {
    var type = 'application/json'
    var req = { headers: { 'content-type': 'application/json' } }

    contentType(type)(req, null, next)

    function next (err, ignore) {
      expect(err).to.be.null
      expect(ignore).to.be.false
      done()
    }
  })

  test('partial string', function (done) {
    var type = 'json'
    var req = { headers: { 'content-type': 'application/json' } }

    contentType(type)(req, null, next)

    function next (err, ignore) {
      expect(err).to.be.null
      expect(ignore).to.be.false
      done()
    }
  })

  test('regexp', function (done) {
    var type = /application\/json/i
    var req = { headers: { 'content-type': 'application/json' } }

    contentType(type)(req, null, next)

    function next (err, ignore) {
      expect(err).to.be.null
      expect(ignore).to.be.false
      done()
    }
  })

  test('cannot match', function (done) {
    var type = /invalid/
    var req = { headers: { 'content-type': 'application/json' } }

    contentType(type)(req, null, next)

    function next (err, ignore) {
      expect(err).to.be.null
      expect(ignore).to.be.true
      done()
    }
  })

  test('missing header', function (done) {
    var type = /invalid/
    var req = { headers: {} }

    contentType(type)(req, null, next)

    function next (err, ignore) {
      expect(err).to.be.null
      expect(ignore).to.be.true
      done()
    }
  })
})
