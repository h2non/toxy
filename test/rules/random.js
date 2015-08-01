const expect = require('chai').expect
const random = require('../..').rules.random

suite('rules#random', function () {
  test('random', function (done) {
    random(100)(null, null, next)

    function next(ignore) {
      expect(ignore).to.be.false
      done()
    }
  })
})
