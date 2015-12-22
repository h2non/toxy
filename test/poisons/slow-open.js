const http = require('http')
const expect = require('chai').expect
const slowOpen = require('../..').poisons.slowOpen

suite('poison#slowOpen', function () {
  test('delay', function (done) {
    const delay = 50
    const req = new http.IncomingMessage()
    const init = Date.now()

    slowOpen({ delay: delay })(req, null, next)

    function next (err) {
      expect(err).to.be.undefined
      expect(Date.now() - init).to.be.at.least(delay - 1)
      done()
    }
  })

  test('close', function (done) {
    const delay = 20
    const req = new http.IncomingMessage()

    slowOpen({ delay: delay })(req, null, next)

    process.nextTick(function () {
      req.emit('close')
    })

    setTimeout(function () {
      done()
    }, delay + 10)

    function next (err) {
      done(new Error('Invalid callback: ' + err))
    }
  })
})
