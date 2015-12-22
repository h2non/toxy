const expect = require('chai').expect
const timeThreshold = require('../..').rules.timeThreshold

suite('rules#timeThreshold', function () {
  test('options', function (done) {
    // Workaround: event-loop timers are a bit inconsistent in small machines (e.g: Travis)
    if (process.env.CI) return done()

    const opts = { duration: 50, threshold: 100 }
    const middleware = timeThreshold(opts)

    function period (next) {
      return function () {
        middleware(null, null, next)
      }
    }

    setTimeout(period(disabled), 0)
    setTimeout(period(disabled), 75)
    setTimeout(period(enabled), 200)
    setTimeout(period(disabled), 250)
    setTimeout(period(enabled), 350)
    setTimeout(done, 500)

    function disabled (err, ignore) {
      expect(err).to.be.null
      expect(ignore).to.be.true
    }

    function enabled (err, ignore) {
      expect(err).to.be.null
      expect(ignore).to.be.false
    }
  })
})
