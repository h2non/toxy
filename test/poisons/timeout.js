const sinon = require('sinon')
const expect = require('chai').expect
const timeout = require('../..').poisons.timeout

suite('poison#timeout', function () {
  test('limit', function (done) {
    const delay = 1000
    const spy = sinon.spy()

    const res = {}
    res.setTimeout = spy

    timeout(delay)(null, res, next)

    function next (err) {
      expect(err).to.be.undefined
      expect(spy.args[0][0]).to.be.equal(delay)
      done()
    }
  })
})
