const http = require('http')
const sinon = require('sinon')
const clone = require('clone')
const expect = require('chai').expect
const slowRead = require('../..').poisons.slowRead

suite('poison#slowRead', function () {
  test('read', function (done) {
    var req = new http.IncomingMessage
    var res = new http.OutgoingMessage
    var threshold = 5
    var spy = sinon.spy()
    var init = Date.now()

    req.method = 'POST'
    req = clone.clonePrototype(req)

    req.__proto__.push = function (data) {
      spy(data)
      if (data === null) assert()
    }

    slowRead({ chunk: 1, threshold: threshold })(req, res, spy)

    req.push(new Buffer('Hello World'))
    req.push(null)

    function assert() {
      expect(Date.now() - init).to.be.at.least(threshold * 10)
      expect(spy.args).to.have.length(13)
      expect(spy.args.shift()[0]).to.be.undefined
      expect(spy.args.shift()[0].toString()).to.be.equal('H')
      expect(spy.args.pop()[0]).to.be.null
      expect(spy.args.pop()[0].toString()).to.be.equal('d')
      done()
    }
  })
})
