const expect = require('chai').expect
const abort = require('../..').poisons.abort

suite('poison#abort', function () {
  test('abort', function (done) {
    var req = { destroy: destroy }

    abort()(req, null)

    function destroy(err) {
      expect(err).to.be.undefined
      done()
    }
  })

  test('abort with custom error', function (done) {
    var req = { destroy: destroy }
    var error = new Error('oops!')
    abort({ error: error })(req, null)

    function destroy(err) {
      expect(err).to.be.equal(error)
      done()
    }
  })
})
