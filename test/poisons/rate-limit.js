const expect = require('chai').expect
const rateLimit = require('../..').poisons.rateLimit

suite('poison#rateLimit', function () {
  test('limit', function (done) {
    var opts = { limit: 2, threshold: 10 }

    var res = {}
    res.setHeader = function (key, value) {
      expect(key).to.match(/RateLimit/i)
    }
    res.end = function (data) {
      expect(data).to.be.undefined
    }

    var invalidRes = {}
    invalidRes.setHeader = function (key, value) {
      if (key === 'X-RateLimit-Limit') {
        expect(value).to.be.equal(2)
      }
      if (key === 'X-RateLimit-Remaining') {
        expect(value).to.be.equal(0)
      }
      if (key === 'X-RateLimit-Reset') {
        expect(value).to.be.below(10)
      }
    }
    invalidRes.end = function (body) {
      expect(body).to.match(/Too many requests/i)
    }

    var limiter = rateLimit(opts)

    limiter(null, res, next)
    limiter(null, res, next)
    limiter(null, invalidRes, next) // invalid

    // Wait to try again
    setTimeout(function () {
      limiter(null, res, next)
      limiter(null, res, end)
    }, opts.threshold + 1)

    function next (err) {
      expect(err).to.be.undefined
    }

    function end (err) {
      next(err)
      done()
    }
  })
})
