const http = require('http')
const clone = require('clone')
const expect = require('chai').expect
const throttle = require('../..').poisons.throttle

suite('poison#throttle', function () {
  test('small chunks', function (done) {
    const opts = { chunk: 1, threshold: 5 }
    const buf = []

    const req = new http.IncomingMessage()
    const res = clone.clonePrototype(new http.OutgoingMessage())

    var lastWrite = Date.now()
    Object.getPrototypeOf(res).write = function (buffer, encoding, next) {
      expect(buffer).to.have.length(opts.chunk)
      expect(Date.now() - lastWrite).to.be.at.least(opts.threshold - 1)
      lastWrite = Date.now()
      buf.push(buffer)
      next()
    }

    Object.getPrototypeOf(res).end = function () {
      expect(buf).to.have.length(11)
      expect(buf.join('')).to.be.equal('Hello World')
      done()
    }

    throttle(opts)(req, res, function (err) {
      expect(err).to.be.undefined
    })

    res.write(new Buffer('Hello '))
    res.write(new Buffer('World'))
    res.end()
  })

  test('single chunk', function (done) {
    const opts = { chunk: 1024, threshold: 10 }

    const buf = []
    const body = new Buffer('Hello World')
    const lastWrite = Date.now()

    const req = new http.IncomingMessage()
    const res = clone.clonePrototype(new http.OutgoingMessage())

    Object.getPrototypeOf(res).write = function (buffer, encoding, next) {
      expect(buffer).to.have.length(body.length)
      expect(Date.now() - lastWrite).to.be.at.least(opts.threshold - 1)
      buf.push(buffer)
      next()
    }

    Object.getPrototypeOf(res).end = function () {
      expect(buf).to.have.length(1)
      expect(buf.join('')).to.be.equal('Hello World')
      done()
    }

    throttle(opts)(req, res, function (err) {
      expect(err).to.be.undefined
    })

    res.write(body)
    res.end()
  })
})
