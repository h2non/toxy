const http = require('http')
const expect = require('chai').expect
const body = require('../..').rules.body

suite('rules#body', function () {
  test('match by string', function (done) {
    const req = new http.IncomingMessage()

    body({ match: 'hello world' })(req, null, next)

    req.push(new Buffer('hello '))
    req.push(new Buffer('world'))
    req.push(null)

    function next (err, ignore) {
      expect(err).to.be.null
      expect(ignore).to.be.false
      done()
    }
  })

  test('match by regexp', function (done) {
    const req = new http.IncomingMessage()

    body({ match: /^hello world$/i })(req, null, next)

    req.push(new Buffer('hello '))
    req.push(new Buffer('world'))
    req.push(null)

    function next (err, ignore) {
      expect(err).to.be.null
      expect(ignore).to.be.false
      done()
    }
  })

  test('match by function', function (done) {
    const req = new http.IncomingMessage()

    function matcher (body) {
      return body.indexOf('hello world') !== -1
    }

    body({ match: matcher })(req, null, next)

    req.push(new Buffer('hello '))
    req.push(new Buffer('world'))
    req.push(null)

    function next (err, ignore) {
      expect(err).to.be.null
      expect(ignore).to.be.false
      done()
    }
  })

  test('cannot match', function (done) {
    const req = new http.IncomingMessage()

    body({ match: 'byebye' })(req, null, next)

    req.push(new Buffer('hello '))
    req.push(new Buffer('world'))
    req.push(null)

    function next (err, ignore) {
      expect(err).to.be.null
      expect(ignore).to.be.true
      done()
    }
  })
})
