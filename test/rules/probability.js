const expect = require('chai').expect
const probability = require('../..').rules.probability

suite('rules#probability', function () {
  test('probability', function (done) {
    probability(100)(null, null, next)

    function next(err, ignore) {
      expect(err).to.be.undefined
      expect(ignore).to.be.undefined
      done()
    }
  })
})
