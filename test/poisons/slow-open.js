const http = require('http')
const sinon = require('sinon')
const expect = require('chai').expect
const slowOpen = require('../..').poisons.slowOpen

suite('poison#slowOpen', function () {
  test('delay', function (done) {
    var delay = 50
    var req = new http.IncomingMessage
    var init = Date.now()

    slowOpen({ delay: delay })(req, null, next)

    function next(err) {
      expect(err).to.be.undefined
      expect(Date.now() - init).to.be.at.least(delay - 1)
      done()
    }
  })

  test('close', function (done) {
    var delay = 20
    var req = new http.IncomingMessage
    var init = Date.now()

    slowOpen({ delay: delay })(req, null, next)

    process.nextTick(function () {
      req.emit('close')
    })

    setTimeout(function () {
      done()
    }, delay + 10)

    function next(err) {
      done(new Error('Invalid callback'))
    }
  })
})
