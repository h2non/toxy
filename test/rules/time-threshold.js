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
    setTimeout(period(enabled), 150)
    setTimeout(period(disabled), 200)
    setTimeout(period(enabled), 300)
    setTimeout(done, 350)

    function disabled(err, ignore) {
      expect(ignore).to.be.true
    }

    function enabled(err, ignore) {
      expect(ignore).to.be.false
    }
  })
})
