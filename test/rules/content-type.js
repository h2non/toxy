const expect = require('chai').expect
const contentType = require('../..').rules.contentType

suite('rules#contentType', function () {
  test('string', function (done) {
    const type = 'application/json'
    const req = { headers: { 'content-type': 'application/json' } }

    contentType(type)(req, null, next)

    function next (err, ignore) {
      expect(err).to.be.null
      expect(ignore).to.be.false
      done()
    }
  })

  test('partial string', function (done) {
    const type = 'json'
    const req = { headers: { 'content-type': 'application/json' } }

    contentType(type)(req, null, next)

    function next (err, ignore) {
      expect(err).to.be.null
      expect(ignore).to.be.false
      done()
    }
  })

  test('regexp', function (done) {
    const type = /application\/json/i
    const req = { headers: { 'content-type': 'application/json' } }

    contentType(type)(req, null, next)

    function next (err, ignore) {
      expect(err).to.be.null
      expect(ignore).to.be.false
      done()
    }
  })

  test('cannot match', function (done) {
    const type = /invalid/
    const req = { headers: { 'content-type': 'application/json' } }

    contentType(type)(req, null, next)

    function next (err, ignore) {
      expect(err).to.be.null
      expect(ignore).to.be.true
      done()
    }
  })

  test('missing header', function (done) {
    const type = /invalid/
    const req = { headers: {} }

    contentType(type)(req, null, next)

    function next (err, ignore) {
      expect(err).to.be.null
      expect(ignore).to.be.true
      done()
    }
  })
})
