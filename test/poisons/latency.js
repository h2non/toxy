const http = require('http')
const expect = require('chai').expect
const latency = require('../..').poisons.latency

suite('poison#latency', function () {
  test('jitter', function (done) {
    const req = new http.IncomingMessage()
    const init = Date.now()
    const opts = { jitter: 50 }

    latency(opts)(req, null, next)

    function next (err) {
      expect(err).to.be.undefined
      expect(Date.now() - init).to.be.at.least(opts.jitter - 2)
      done()
    }
  })

  test('jitter as number', function (done) {
    const req = new http.IncomingMessage()
    const init = Date.now()
    const jitter = 50

    latency(jitter)(req, null, next)

    function next (err) {
      expect(err).to.be.undefined
      expect(Date.now() - init).to.be.at.least(jitter - 2)
      done()
    }
  })

  test('range', function (done) {
    const req = new http.IncomingMessage()
    const init = Date.now()
    const opts = { min: 50, max: 100 }

    latency(opts)(req, null, next)

    function next (err) {
      expect(err).to.be.undefined
      expect(Date.now() - init).to.be.at.within(opts.min, opts.max + 10)
      done()
    }
  })

  test('close connection', function (done) {
    const req = new http.IncomingMessage()
    const init = Date.now()
    const opts = { jitter: 1000 }

    latency(opts)(req, null, next)

    process.nextTick(function () {
      req.emit('close')
    })

    function next (err) {
      expect(err).to.be.equal('client connection closed')
      expect(Date.now() - init).to.be.below(opts.jitter)
      done()
    }
  })
})
