const http = require('http')
const clone = require('clone')
const expect = require('chai').expect
const bandwidth = require('../..').poisons.bandwidth

suite('poison#bandwidth', function () {
  test('bandwidth', function (done) {
    const opts = { bps: 1, threshold: 5 }
    const req = new http.IncomingMessage()
    const res = clone.clonePrototype(new http.OutgoingMessage())

    const buf = []
    var lastWrite = Date.now()

    Object.getPrototypeOf(res).write = function (buffer, encoding, next) {
      expect(buffer).to.have.length(opts.bps)
      expect(Date.now() - lastWrite).to.be.least(opts.threshold - 1)
      lastWrite = Date.now()
      buf.push(buffer)
      next()
    }

    Object.getPrototypeOf(res).end = function () {
      expect(buf).to.have.length(11)
      expect(buf.join('')).to.be.equal('Hello World')
      console.log('')
      done()
    }

    bandwidth(opts)(req, res, function (err) {
      expect(err).to.be.undefined
    })

    res.write(new Buffer('Hello '))
    res.write(new Buffer('World'))
    res.end()
  })
})
