const expect = require('chai').expect
const timeThreshold = require('../..').rules.timeThreshold

suite('rules#timeThreshold', function () {
  test('options', function (done) {
    var opts = { duration: 50, threshold: 100 }
    var middleware = timeThreshold(opts)

    function period(next) {
      return function () {
        middleware(null, null, next)
      }
    }

    setTimeout(period(disabled), 0)
    setTimeout(period(disabled), 75)
    setTimeout(period(enabled), 120)
    setTimeout(period(enabled), 150)
    setTimeout(period(disabled), 170)
    setTimeout(period(disabled), 200)
    setTimeout(period(disabled), 220)
    setTimeout(period(enabled), 280)
    setTimeout(done, 300)

    function disabled(err, ignore) {
      expect(ignore).to.be.true
    }

    function enabled(err, ignore) {
      expect(ignore).to.be.false
    }
  })
})
