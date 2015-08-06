const http = require('http')
const sinon = require('sinon')
const clone = require('clone')
const expect = require('chai').expect
const throttle = require('../..').poisons.throttle

suite('poison#throttle', function () {
  test('small chunks', function (done) {
    var req = new http.IncomingMessage
    var res = new http.OutgoingMessage
    var opts = { chunk: 1, threshold: 5 }

    var buf = []
    var lastWrite = Date.now()
    res = clone.clonePrototype(res)

    res.__proto__.write = function (buffer, encoding, next) {
      expect(buffer).to.have.length(opts.chunk)
      expect(Date.now() - lastWrite).to.be.at.least(opts.threshold - 1)
      lastWrite = Date.now()
      buf.push(buffer)
      next()
    }

    res.__proto__.end = function () {
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
    var req = new http.IncomingMessage
    var res = new http.OutgoingMessage
    var opts = { chunk: 1024, threshold: 10 }

    var buf = []
    var body = new Buffer('Hello World')
    var lastWrite = Date.now()
    res = clone.clonePrototype(res)

    res.__proto__.write = function (buffer, encoding, next) {
      expect(buffer).to.have.length(body.length)
      expect(Date.now() - lastWrite).to.be.at.least(opts.threshold - 1)
      buf.push(buffer)
      next()
    }

    res.__proto__.end = function () {
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
