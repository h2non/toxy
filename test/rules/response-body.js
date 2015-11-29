const expect = require('chai').expect
const body = require('../..').rules.responseBody

suite('rules#responseBody', function () {
  test('match by string', function (done) {
    var res = { body: 'John said hello world' }

    body({ match: 'hello world' })(null, res, next)

    function next (err, ignore) {
      expect(err).to.be.null
      expect(ignore).to.be.false
      done()
    }
  })

  test('match by regexp', function (done) {
    var res = { body: 'salutation: hello world' }

    body({ match: /hello world$/i })(null, res, next)

    function next (err, ignore) {
      expect(err).to.be.null
      expect(ignore).to.be.false
      done()
    }
  })

  test('match by function', function (done) {
    var res = { body: 'hey, hello world' }

    function matcher (body) {
      return !!~body.indexOf('hello world')
    }

    body({ match: matcher })(null, res, next)

    function next (err, ignore) {
      expect(err).to.be.null
      expect(ignore).to.be.false
      done()
    }
  })

  test('match buffer', function (done) {
    var res = { body: new Buffer('hello world') }

    body({ match: 'hello' })(null, res, next)

    function next (err, ignore) {
      expect(err).to.be.null
      expect(ignore).to.be.false
      done()
    }
  })

  test('cannot match', function (done) {
    var res = { body: 'foo bar' }

    body({ match: 'hello' })(null, res, next)

    function next (err, ignore) {
      expect(err).to.be.null
      expect(ignore).to.be.true
      done()
    }
  })
})
