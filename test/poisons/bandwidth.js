const http = require('http')
const clone = require('clone')
const expect = require('chai').expect
const bandwidth = require('../..').poisons.bandwidth

suite('poison#bandwidth', function () {
  test('bandwidth', function (done) {
    var req = new http.IncomingMessage()
    var res = new http.OutgoingMessage()
    var opts = { bps: 1, threshold: 5 }

    var buf = []
    var lastWrite = Date.now()
    res = clone.clonePrototype(res)

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
