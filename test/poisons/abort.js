const expect = require('chai').expect
const abort = require('../..').poisons.abort

suite('poison#abort', function () {
  test('default', function (done) {
    const req = { destroy: destroy, socket: {} }

    abort()(req, null)

    function destroy (err) {
      expect(err).to.be.undefined
      done()
    }
  })

  test('custom error', function (done) {
    const req = { destroy: destroy, socket: {} }
    const error = new Error('oops!')
    abort({ error: error })(req, null)

    function destroy (err) {
      expect(err).to.be.equal(error)
      done()
    }
  })

  test('next', function (done) {
    var continued = false
    const req = { destroy: destroy, socket: {} }

    abort({ next: true })(req, null, next)

    function destroy (err) {
      expect(err).to.be.empty
      expect(continued).to.be.true
      done()
    }

    function next (err) {
      expect(err).to.be.empty
      continued = true
    }
  })
})
