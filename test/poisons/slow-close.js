const sinon = require('sinon')
const expect = require('chai').expect
const slowClose = require('../..').poisons.slowClose

suite('poison#slowClose', function () {
  test('close', function (done) {
    var delay = 50
    var expected = { body: 'Hello', code: 200, headers: { server: 'rocky' }}
    var spy = sinon.spy()
    var init = Date.now()

    var res = {}
    res.writeHead = spy
    res.end = function (body) {
      spy(body)
      end()
    }

    slowClose({ delay: delay })(null, res, spy)

    res.writeHead(200, { 'content-length': 100, server: 'rocky' })
    res.end(expected.body)

    function end(err) {
      expect(Date.now() - init).to.be.at.least(delay)
      expect(spy.calledThrice).to.be.true
      expect(spy.args[1][0]).to.be.equal(expected.code)
      expect(spy.args[1][1]).to.be.deep.equal(expected.headers)
      expect(spy.args[2][0]).to.be.equal(expected.body)
      done()
    }
  })
})
