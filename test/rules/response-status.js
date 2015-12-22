const expect = require('chai').expect
const responseStatus = require('../..').rules.responseStatus

suite('rules#responseStatus', function () {
  test('default', function () {
    assert(null, 200, equals(false))
    assert(null, 500, equals(true))
    assert(null, 0, equals(undefined))
    assert(null, null, equals(undefined))
  })

  test('range', function () {
    assert([200, 400], 204, equals(false))
    assert([200, 400], 400, equals(false))
    assert([200, 400], 500, equals(true))
    assert([200, 200], 201, equals(true))
  })

  test('value', function () {
    assert(204, 204, equals(false))
    assert(400, 400, equals(false))
    assert(300, 500, equals(true))
    assert(-1, 200, equals(true))
  })

  test('lower', function () {
    assert({ lower: 300 }, 204, equals(false))
    assert({ lower: 300 }, 400, equals(true))
    assert({ lower: 0 }, 200, equals(false))
  })

  test('higher', function () {
    assert({ higher: 200 }, 204, equals(false))
    assert({ higher: 300 }, 200, equals(true))
    assert({ higher: 0 }, 200, equals(false))
  })

  test('include', function () {
    assert({ include: [204] }, 204, equals(false))
    assert({ include: [201] }, 200, equals(true))
    assert({ include: [204, 400, 200] }, 200, equals(false))
    assert({ include: [] }, 200, equals(true))
  })
})

function assert (opts, status, assert) {
  const res = { statusCode: status }
  responseStatus(opts)(null, res, assert)
}

function equals (value) {
  return function (err, ignore) {
    expect(err).to.be.null
    expect(ignore).to.be.equal(value)
  }
}
